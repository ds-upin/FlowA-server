const UnverifiedUser = require('../models/UnverifiedUser');
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const VerifySendEmail = require('../services/VerifyEmail');
const jwt = require('jsonwebtoken');

const postRegister = async (req, res) => {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
        return res.status(400).json({ mess: 'Insufficient data' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ mess: 'User is already registered' });
        }

        const existingUserName = await User.findOne({ username });
        if (existingUserName) {
            return res.status(409).json({ mess: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const code = Math.floor(100000 + Math.random() * 900000);

        await UnverifiedUser.create({
            name,
            email,
            username,
            password: hashedPassword,
            code
        });

        await VerifySendEmail(email, name, username, code);

        return res.status(201).json({ mess: 'Registered successfully. Verification email sent.' });
    } catch (err) {
        console.error('Error during registration:', err);
        return res.status(500).json({ mess: 'Failed to register.' });
    }
};

const postVerifyEmail = async (req, res) => {
    const { code, email } = req.body;

    if (!code || !email) {
        return res.status(400).json({ mess: 'Verification code and email are required.' });
    }

    try {
        const unverified = await UnverifiedUser.findOne({ email });

        if (!unverified) {
            return res.status(404).json({ mess: 'No unverified account found for this email.' });
        }
        if (String(code) !== String(unverified.code)) {
            return res.status(401).json({ mess: 'Invalid verification code.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ mess: 'User is already registered.' });
        }
        const { name, username, password } = unverified;
        await User.create({ name, username, email, password });
        await UnverifiedUser.deleteOne({ email });

        return res.status(201).json({ mess: 'Email verified and user registered successfully.' });
    } catch (err) {
        console.error('Verification error:', err);
        return res.status(500).json({ mess: 'Unable to verify email.' });
    }
};

const postLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ mess: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ mess: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ mess: 'Invalid credentials.' });
        }
        const payload = {
            id: user._id,
            username: user.username,
            email: user.email
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '3h' }
        );

        return res.status(200).json({
            mess: 'Login successful.',
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                token
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ mess: 'Login failed. Please try again.' });
    }
};

const postLogout = async (req, res) => { 
    return res.status(200).json({ mess: 'Logged out successfully. Please delete the token on client side.' });
};

const getMe = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ mess: 'Unauthorized' });
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ mess: 'User not found' });
        }

        return res.status(200).json({ user });
    } catch (err) {
        console.error('Error in getMe:', err);
        return res.status(500).json({ mess: 'Failed to retrieve user data' });
    }
};

module.exports = {
    postRegister,
    postLogin,
    postLogout,
    getMe,
    postVerifyEmail,
};