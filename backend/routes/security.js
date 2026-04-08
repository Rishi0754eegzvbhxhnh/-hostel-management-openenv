/**
 * routes/security.js
 * Digital Security & Access Control System
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SecurityLog = require('../models/SecurityLog');
const User = require('../models/User');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123'); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};

// ── Seed security logs ──────────────────────────────────────────────────────
router.post('/seed', async (req, res) => {
  try {
    const count = await SecurityLog.countDocuments();
    if (count > 0) return res.json({ message: 'Already seeded', count });

    const users = await User.find().limit(5);
    const logs = [];

    users.forEach((user, idx) => {
      logs.push({
        user: user._id,
        type: 'entry',
        method: ['face_recognition', 'qr_code', 'rfid'][idx % 3],
        location: 'Main Gate',
        status: 'authorized',
        timestamp: new Date(Date.now() - Math.random() * 24 * 3600 * 1000),
        metadata: {
          confidenceScore: 0.95 + Math.random() * 0.05,
          imageUrl: 'https://via.placeholder.com/150'
        }
      });

      logs.push({
        user: user._id,
        type: 'exit',
        method: 'qr_code',
        location: 'Main Gate',
        status: 'authorized',
        timestamp: new Date(Date.now() - Math.random() * 12 * 3600 * 1000),
        metadata: {
          confidenceScore: 0.98,
          imageUrl: 'https://via.placeholder.com/150'
        }
      });
    });

    await SecurityLog.insertMany(logs);
    res.json({ success: true, message: `✅ ${logs.length} security logs created`, count: logs.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/security — All security logs (admin) ──────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const logs = await SecurityLog.find()
      .populate('user', 'fullName email collegeId')
      .sort({ timestamp: -1 })
      .limit(100);

    const stats = {
      totalEntries: await SecurityLog.countDocuments({ type: 'entry' }),
      totalExits: await SecurityLog.countDocuments({ type: 'exit' }),
      flagged: await SecurityLog.countDocuments({ status: 'flagged' }),
      blocked: await SecurityLog.countDocuments({ status: 'blocked' })
    };

    res.json({ success: true, logs, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/security/user/:userId — User's access history ─────────────────
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const logs = await SecurityLog.find({ user: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/security/entry — Log entry event ──────────────────────────────
router.post('/entry', auth, async (req, res) => {
  try {
    const { method = 'qr_code', location = 'Main Gate', confidenceScore } = req.body;

    const log = new SecurityLog({
      user: req.user.id,
      type: 'entry',
      method,
      location,
      status: confidenceScore && confidenceScore < 0.7 ? 'flagged' : 'authorized',
      metadata: {
        confidenceScore: confidenceScore || 0.95,
        imageUrl: 'https://via.placeholder.com/150'
      }
    });

    await log.save();
    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/security/exit — Log exit event ────────────────────────────────
router.post('/exit', auth, async (req, res) => {
  try {
    const { method = 'qr_code', location = 'Main Gate' } = req.body;

    const log = new SecurityLog({
      user: req.user.id,
      type: 'exit',
      method,
      location,
      status: 'authorized',
      metadata: {
        confidenceScore: 0.98,
        imageUrl: 'https://via.placeholder.com/150'
      }
    });

    await log.save();
    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/security/qr/:userId — Generate QR code data ────────────────────
router.get('/qr/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const qrData = {
      userId: user._id,
      name: user.fullName,
      collegeId: user.collegeId,
      timestamp: new Date().toISOString(),
      type: 'hostel_access'
    };

    res.json({ success: true, qrData, qrString: JSON.stringify(qrData) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
