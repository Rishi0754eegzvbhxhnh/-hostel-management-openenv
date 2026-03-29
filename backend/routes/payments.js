const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
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

// GET /api/payments/my
router.get('/my', auth, async (req, res) => {
  try {
    const tx = await Transaction.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/payments
router.post('/', auth, async (req, res) => {
  try {
    const { title, amount, paymentType } = req.body;
    const tx = new Transaction({
      student: req.user.id,
      title,
      amount,
      paymentType,
      referenceNo: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'successful'
    });
    await tx.save();
    res.status(201).json({ message: 'Payment successful', transaction: tx });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
