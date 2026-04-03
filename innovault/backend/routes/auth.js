const router = require('express').Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid');
const dns = require('dns');

// Force IPv4 DNS resolution first to prevent ENETUNREACH on Render's IPv6 network
dns.setDefaultResultOrder('ipv4first');

const validatePassword = require('../middleware/validatePassword');
const { incrementLoginAttempts, getLoginAttempts, clearLoginAttempts } = require('../services/cacheService');
 
// Setup Nodemailer Transporter using SendGrid API Wait
const transporter = nodemailer.createTransport(sgTransport({
    apiKey: process.env.SENDGRID_API_KEY
}));

// Send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { email, type } = req.body;
        if (!email) return res.status(400).send('Email is required');

        // Check user existence
        const emailExist = await User.findOne({ email });
        
        if (type === 'reset') {
            if (!emailExist) return res.status(400).send('Email not registered');
        } else {
            if (emailExist) return res.status(400).send('Email already registered');
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to Database (upsert — overwrite if user requests again)
        await Otp.findOneAndUpdate(
            { email },
            { otp: otpCode, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Send Email Synchronously
        const mailOptions = {
            from: process.env.FROM_EMAIL || 'no-reply@innovault.com',
            to: email,
            subject: `Innovault ${type === 'reset' ? 'Password Reset' : 'Email Verification'} OTP`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                    <h2>Welcome to Innovault!</h2>
                    <p>Your verification code is:</p>
                    <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 5px;">${otpCode}</h1>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send({ message: 'OTP sent to email successfully' });
    } catch (err) {
        console.error('Email send error:', err);
        res.status(500).send('Failed to send OTP. Please try again.');
    }
});

// Register
router.post('/register', validatePassword, async (req, res) => {
    try {
        const { username, email, password, otp } = req.body;

        if (!otp) return res.status(400).send('OTP is required');

        // Check OTP
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) return res.status(400).send('Invalid or expired OTP');

        // Check if user exists (edge case if they hit register directly)
        const emailExist = await User.findOne({ email });
        if (emailExist) return res.status(400).send('Email already exists');

        // Hash password
        const salt = await bcrypt.genSalt(11); // Professional cost factor
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine Role based on Domain (catches @student.nitw.ac.in as well)
        const isNitw = email.toLowerCase().endsWith('nitw.ac.in');
        const role = isNitw ? 'VERIFIED' : 'EXTERNAL';

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role
        }); 

        const savedUser = await user.save();
        
        // Clean up OTP
        await Otp.deleteOne({ email });

        res.send({ user: user._id, role: user.role });
    } catch (err) {
        res.status(400).send(err);
    }
});

// Get Current User
router.get('/me', require('../middleware/verifyToken'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.send(user);
    } catch (err) {
        res.status(400).send(err);
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check Redis for brute-force lock BEFORE querying DB or comparing passwords
        const attempts = await getLoginAttempts(email);
        if (attempts >= 5) {
            return res.status(429).send('Account temporarily locked due to too many failed login attempts. Please try again in 15 minutes.');
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            // Even if user doesn't exist, we track the attempt to prevent email enumeration attacks backing brute forcing
            await incrementLoginAttempts(email);
            return res.status(400).send('Invalid email or password');
        }

        // Check password
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            await incrementLoginAttempts(email);
            return res.status(400).send('Invalid email or password');
        }

        // Clear attempts on success
        await clearLoginAttempts(email);

        // Create and assign token
        const token = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        res.header('auth-token', token).send(token);
    } catch (err) {
        res.status(400).send(err);
    }
});

// Reset Password
router.post('/reset-password', validatePassword, async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) return res.status(400).send('All fields are required');

        // Verify OTP
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) return res.status(400).send('Invalid or expired OTP');

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('No account found with this email');

        // Hash new password
        const salt = await bcrypt.genSalt(11);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user
        user.password = hashedPassword;
        await user.save();

        // Clean up OTP
        await Otp.deleteOne({ email });

        res.status(200).send({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).send('Failed to reset password');
    }
});

module.exports = router;
 
