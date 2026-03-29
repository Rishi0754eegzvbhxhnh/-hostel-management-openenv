const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

// POST /api/complaints — student submits complaint with optional base64 images
router.post('/', auth, async (req, res) => {
  try {
    const { category, title, description, roomNumber, priority, images } = req.body;
    const complaint = new Complaint({
      student: req.user.id,
      studentName: req.body.studentName || 'Unknown Student',
      studentEmail: req.body.studentEmail || '',
      roomNumber,
      category,
      title,
      description,
      priority: priority || 'medium',
      images: images || [],
    });
    await complaint.save();
    res.status(201).json({ message: 'Complaint submitted successfully', complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/complaints/my — student's own complaints
router.get('/my', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/complaints — admin sees all
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/complaints/:id — admin updates status
router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { status, adminResponse, priority } = req.body;
    const update = { status, adminResponse, priority };
    if (status === 'resolved') update.resolvedAt = new Date();
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
