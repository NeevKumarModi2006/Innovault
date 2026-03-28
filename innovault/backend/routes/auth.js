const router = require('express').Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Setup Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).send('Email is required');

        // Check if user already exists
        const emailExist = await User.findOne({ email });
        if (emailExist) return res.status(400).send('Email already registered');

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to Database (upsert — overwrite if user requests again)
        await Otp.findOneAndUpdate(
            { email },
            { otp: otpCode, createdAt: Date.now() },
            { upsert: true, new: true }
        );

        // Send Email
        const mailOptions = {
            from: process.env.FROM_EMAIL || 'no-reply@innovault.com',
            to: email,
            subject: 'Innovault Email Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                    <h2>Welcome to Innovault!</h2>
                    <p>Your email verification code is:</p>
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
router.post('/register', async (req, res) => {
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
        const salt = await bcrypt.genSalt(10);
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

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send('Email is not found');

        // Check password
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).send('Invalid password');

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

module.exports = router;
