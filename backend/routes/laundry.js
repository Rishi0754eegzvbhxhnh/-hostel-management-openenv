/**
 * routes/laundry.js
 * Laundry Machine Management System
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const LaundryStatus = require('../models/LaundryStatus');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123'); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};

// ── Seed laundry machines ───────────────────────────────────────────────────
router.post('/seed', async (req, res) => {
  try {
    const count = await LaundryStatus.countDocuments();
    if (count > 0) return res.json({ message: 'Already seeded', count });

    const machines = [];
    for (let i = 1; i <= 12; i++) {
      machines.push({
        machineNumber: i,
        status: i % 3 === 0 ? 'running' : (i % 4 === 0 ? 'out_of_order' : 'idle'),
        timeRemaining: i % 3 === 0 ? Math.floor(Math.random() * 45) + 5 : 0,
        lastWashDate: new Date(Date.now() - Math.random() * 7 * 24 * 3600 * 1000)
      });
    }

    await LaundryStatus.insertMany(machines);
    res.json({ success: true, message: `✅ ${machines.length} laundry machines created`, count: machines.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/laundry — All machines status ──────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const machines = await LaundryStatus.find().sort({ machineNumber: 1 });

    const stats = {
      total: machines.length,
      idle: machines.filter(m => m.status === 'idle').length,
      running: machines.filter(m => m.status === 'running').length,
      outOfOrder: machines.filter(m => m.status === 'out_of_order').length
    };

    res.json({ success: true, machines, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/laundry/:machineNumber — Single machine details ────────────────
router.get('/:machineNumber', async (req, res) => {
  try {
    const machine = await LaundryStatus.findOne({ machineNumber: parseInt(req.params.machineNumber) });
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });

    res.json({ success: true, machine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/laundry/:machineNumber/start — Start a machine ────────────────
router.post('/:machineNumber/start', auth, async (req, res) => {
  try {
    const { duration = 45 } = req.body;
    const machine = await LaundryStatus.findOne({ machineNumber: parseInt(req.params.machineNumber) });

    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });
    if (machine.status !== 'idle') return res.status(400).json({ success: false, message: 'Machine is not available' });

    machine.status = 'running';
    machine.timeRemaining = duration;
    machine.lastWashDate = new Date();
    await machine.save();

    res.json({ success: true, message: `Machine ${machine.machineNumber} started for ${duration} minutes`, machine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/laundry/:machineNumber/stop — Stop a machine ──────────────────
router.post('/:machineNumber/stop', auth, async (req, res) => {
  try {
    const machine = await LaundryStatus.findOne({ machineNumber: parseInt(req.params.machineNumber) });

    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });

    machine.status = 'idle';
    machine.timeRemaining = 0;
    await machine.save();

    res.json({ success: true, message: `Machine ${machine.machineNumber} stopped`, machine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/laundry/:machineNumber/report — Report machine issue ──────────
router.post('/:machineNumber/report', auth, async (req, res) => {
  try {
    const { issue } = req.body;
    const machine = await LaundryStatus.findOne({ machineNumber: parseInt(req.params.machineNumber) });

    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });

    machine.status = 'out_of_order';
    machine.timeRemaining = 0;
    await machine.save();

    res.json({ success: true, message: `Machine ${machine.machineNumber} marked as out of order. Issue: ${issue}`, machine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/laundry/:machineNumber/repair — Mark machine as repaired ──────
router.post('/:machineNumber/repair', auth, async (req, res) => {
  try {
    const machine = await LaundryStatus.findOne({ machineNumber: parseInt(req.params.machineNumber) });

    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });

    machine.status = 'idle';
    machine.timeRemaining = 0;
    await machine.save();

    res.json({ success: true, message: `Machine ${machine.machineNumber} repaired and ready to use`, machine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
