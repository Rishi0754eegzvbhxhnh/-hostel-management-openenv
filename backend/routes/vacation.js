const express = require('express');
const router = express.Router();
const Vacation = require('../models/Vacation');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// GET /api/vacation/my
router.get('/my', auth, async (req, res) => {
  try {
    const vacations = await Vacation.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(vacations);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/vacation
router.post('/', auth, async (req, res) => {
  try {
    const { departDate, returnDate, reason } = req.body;
    const vacation = new Vacation({
      student: req.user.id,
      departDate,
      returnDate,
      reason: reason || '',
      status: 'approved', // Auto-approve for demo
    });
    await vacation.save();
    res.status(201).json({ message: 'Vacation marked. Kitchen notified!', vacation });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/vacation/:id (cancel)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Vacation.findOneAndDelete({ _id: req.params.id, student: req.user.id });
    res.json({ message: 'Vacation cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
