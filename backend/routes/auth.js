const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey123', { expiresIn: '24h' });

// ─── Admin Register ────────────────────────────────────────────────────────────
router.post('/admin/register', async (req, res) => {
  try {
    const { fullName, email, password, adminCode } = req.body;
    // Simple admin code gate (change this to something secret)
    if (adminCode !== (process.env.ADMIN_CODE || 'HOSTEL_ADMIN_2024')) {
      return res.status(403).json({ message: 'Invalid admin registration code' });
    }
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({
      fullName, email, password,
      collegeId: `ADMIN-${Date.now()}`,
      phone: '0000000000',
      role: 'admin',
    });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({ message: 'Admin registered', token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── Admin Login ──────────────────────────────────────────────────────────────
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) return res.status(400).json({ message: 'No admin account found with this email' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ message: 'Admin login successful', token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    console.error('SYSTEM ERROR during Admin Login:', err.message);
    res.status(500).json({ 
      message: 'Server Integrity Error', 
      error: err.message,
      tip: 'Check if the password was hashed correctly or if the database is reachable.'
    });
  }
});

// ─── Email/Password Register ─────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { fullName, collegeId, email, phone, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    user = new User({ fullName, collegeId, email, phone, password });
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── Email/Password Login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('SYSTEM ERROR during Login:', err.message);
    res.status(500).json({ 
      message: 'Login Execution Failed', 
      error: err.message 
    });
  }
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/google', (req, res, next) => {
  if (!passport._strategy('google')) {
    return res.status(501).json({ message: 'Google OAuth not configured on server' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!passport._strategy('google')) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/?error=google_not_configured`);
  }
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/?error=google_failed` })(req, res, next);
}, (req, res) => {
    const token = generateToken(req.user);
    const user = encodeURIComponent(JSON.stringify({
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
    }));
    // Redirect to frontend with token and user in URL
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?token=${token}&user=${user}`);
});

// ─── GitHub OAuth ─────────────────────────────────────────────────────────────
router.get('/github', (req, res, next) => {
  if (!passport._strategy('github')) {
    return res.status(501).json({ message: 'GitHub OAuth not configured on server' });
  }
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
  if (!passport._strategy('github')) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/?error=github_not_configured`);
  }
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/?error=github_failed` })(req, res, next);
}, (req, res) => {
    const token = generateToken(req.user);
    const user = encodeURIComponent(JSON.stringify({
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
    }));
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?token=${token}&user=${user}`);
});

module.exports = router;
