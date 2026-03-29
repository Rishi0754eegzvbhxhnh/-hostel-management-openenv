const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Maintenance = require('../models/Maintenance');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123'); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
};

// GET /api/admin/stats — dashboard summary
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const openMaintenance = await Maintenance.countDocuments({ status: { $in: ['open', 'in_progress'] } });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    res.json({ totalStudents, pendingComplaints, openMaintenance, resolvedComplaints });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/students — all students
router.get('/students', auth, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/maintenance
router.get('/maintenance', auth, adminOnly, async (req, res) => {
  try {
    const items = await Maintenance.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/maintenance/:id
router.patch('/maintenance/:id', auth, adminOnly, async (req, res) => {
  try {
    const item = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/maintenance — create maintenance ticket
router.post('/maintenance', auth, async (req, res) => {
  try {
    const item = new Maintenance(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
