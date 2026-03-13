const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
    require('fs').writeFileSync('debug.txt', 'HIT ROUTE\n');
    try {
        const { username, email, password } = req.body;
        require('fs').appendFileSync('debug.txt', 'BODY EXTRACTED\n');

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ message: 'User with that email or username already exists' });
        }

        user = new User({ username, email, password });
        await user.save();

        return res.status(201).json({ message: 'User registered successfully, please log in.' });
    } catch (err) {
        console.error('🔥 REGISTER ERROR:', err);
        return res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id, username: user.username } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                return res.json({
                    token,
                    user: { id: user.id, username: user.username, email: user.email }
                });
            }
        );
    } catch (err) {
        console.error('🔥 LOGIN ERROR:', err);
        return res.status(500).json({ message: 'Server error: ' + err.message });
    }
});

router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error('🔥 GET USER ERROR:', err);
        return res.status(500).json({ message: 'Server Error: ' + err.message });
    }
});

module.exports = router;
