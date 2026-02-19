const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const emailExist = await User.findOne({ email });
        if (emailExist) return res.status(400).send('Email already exists');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Determine Role based on Domain
        const isNitw = email.toLowerCase().endsWith('@nitw.ac.in');
        const role = isNitw ? 'VERIFIED' : 'EXTERNAL';

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role
        });

        const savedUser = await user.save();
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
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'secret');
        res.header('auth-token', token).send(token);
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
