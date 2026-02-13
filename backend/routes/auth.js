const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register new user
router.post('/register', async (req, res) => {
    try {
        console.log('Registration attempt received:', req.body.email);
        const { name, email, password, academicLevel } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new user
        const user = new User({ name, email, password, academicLevel });
        await user.save();

        // Create session
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.academicLevel = user.academicLevel;

        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                academicLevel: user.academicLevel
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        console.log('Login attempt received:', req.body.email);
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Create session
        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.academicLevel = user.academicLevel;

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                academicLevel: user.academicLevel
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Logout user
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Check authentication status
router.get('/check-auth', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            authenticated: true,
            user: {
                id: req.session.userId,
                name: req.session.userName,
                academicLevel: req.session.academicLevel
            }
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Update profile route
router.put('/update-profile', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { academicLevel } = req.body;
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (academicLevel) {
            user.academicLevel = academicLevel;
            req.session.academicLevel = academicLevel;
        }

        await user.save();
        res.json({ message: 'Profile updated successfully', user: { academicLevel: user.academicLevel } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
