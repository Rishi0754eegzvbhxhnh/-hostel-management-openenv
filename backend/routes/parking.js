/**
 * routes/parking.js
 * Smart Parking Management System for Hostel
 */
const express = require('express');
const router  = express.Router();
const jwt = require('jsonwebtoken');
const ParkingSlot = require('../models/ParkingSlot');
const hf          = require('../services/huggingFaceService');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123'); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};

// ── Seed 40 parking slots (A1-A10, B1-B10, C1-C10, D1-D10) ─────────────────
router.post('/seed', async (req, res) => {
  try {
    const count = await ParkingSlot.countDocuments();
    if (count > 0) return res.json({ message: 'Already seeded', count });

    const slots = [];
    ['A', 'B', 'C', 'D'].forEach(zone => {
      for (let i = 1; i <= 10; i++) {
        slots.push({
          slotId: `${zone}-${String(i).padStart(2, '0')}`,
          zone,
          slotNumber: i,
          type: i <= 6 ? 'bike' : 'car',
          isOccupied: Math.random() > 0.7, // ~30% pre-filled for demo
          vehicleNo: null,
          totalUsage: Math.floor(Math.random() * 20),
        });
      }
    });

    // Fill some random slots with demo vehicles
    const demoVehicles = ['MH-12-AB-1234','DL-01-CD-5678','KA-05-EF-9012','TN-09-GH-3456','GJ-14-IJ-7890'];
    slots.filter(s => s.isOccupied).forEach((s, i) => {
      s.vehicleNo = demoVehicles[i % demoVehicles.length];
      s.vehicleType = s.type === 'car' ? 'car' : 'bike';
      s.studentName = ['Rishi Kumar', 'Priya Sharma', 'Arjun Singh'][i % 3];
      s.entryTime = new Date(Date.now() - Math.random() * 5 * 3600 * 1000);
    });

    await ParkingSlot.insertMany(slots);
    res.json({ success: true, message: `✅ ${slots.length} parking slots created`, count: slots.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/parking — All slots with live status ────────────────────────────
router.get('/', async (req, res) => {
  try {
    const slots = await ParkingSlot.find().sort({ zone: 1, slotNumber: 1 });
    const total    = slots.length;
    const occupied = slots.filter(s => s.isOccupied).length;
    const bikes    = slots.filter(s => s.isOccupied && s.vehicleType === 'bike').length;
    const cars     = slots.filter(s => s.isOccupied && s.vehicleType === 'car').length;

    // Nearest available slot algorithm (returns first free slot per zone)
    const nearestAvailable = {};
    ['A', 'B', 'C', 'D'].forEach(zone => {
      const free = slots.find(s => s.zone === zone && !s.isOccupied);
      nearestAvailable[zone] = free?.slotId || null;
    });

    res.json({
      success: true,
      slots,
      stats: { total, occupied, available: total - occupied, bikes, cars },
      nearestAvailable,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/parking/entry — Vehicle enters, assigns nearest slot ────────────
router.post('/entry', async (req, res) => {
  try {
    const { vehicleNo, vehicleType = 'bike', studentName, blockNo, preferredZone } = req.body;
    if (!vehicleNo) return res.status(400).json({ success: false, message: 'Vehicle number required' });

    // Parse/clean vehicle number using HF utility
    const parsed = hf.parseVehicleNumber(vehicleNo);
    const cleanVehicleNo = parsed.vehicleNo;

    // Check if already parked
    const existing = await ParkingSlot.findOne({ vehicleNo: cleanVehicleNo, isOccupied: true });
    if (existing) {
      return res.status(409).json({ success: false, message: `Vehicle ${cleanVehicleNo} is already parked at ${existing.slotId}`, slot: existing });
    }

    // Find nearest available slot (preferred zone first, then any)
    let query = { isOccupied: false, type: { $in: [vehicleType, 'both'] } };
    if (preferredZone) query.zone = preferredZone;

    let slot = await ParkingSlot.findOne(query).sort({ zone: 1, slotNumber: 1 });
    if (!slot && preferredZone) {
      delete query.zone;
      slot = await ParkingSlot.findOne(query).sort({ zone: 1, slotNumber: 1 });
    }

    if (!slot) return res.status(503).json({ success: false, message: 'No available parking slots' });

    // Assign the slot
    slot.isOccupied  = true;
    slot.vehicleNo   = cleanVehicleNo;
    slot.vehicleType = vehicleType;
    slot.studentName = studentName || 'Guest';
    slot.blockNo     = blockNo;
    slot.entryTime   = new Date();
    slot.totalUsage  += 1;
    await slot.save();

    // Generate guidance
    const guidance = `🅿️ Slot ${slot.slotId} assigned!\n📍 Zone ${slot.zone}, Slot #${slot.slotNumber}\n🚦 Enter from Gate ${slot.zone}, turn ${slot.slotNumber <= 5 ? 'left' : 'right'}, count ${slot.slotNumber} slots.`;

    res.json({
      success: true,
      message: `Vehicle parked at ${slot.slotId}`,
      slot,
      guidance,
      student_id: req.user?.id || null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/parking/exit/:slotId — Vehicle exits ───────────────────────────
router.post('/exit/:slotId', async (req, res) => {
  try {
    const slot = await ParkingSlot.findOne({ slotId: req.params.slotId });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    if (!slot.isOccupied) return res.status(400).json({ success: false, message: 'Slot is already free' });

    const duration = slot.entryTime
      ? Math.round((Date.now() - new Date(slot.entryTime)) / 60000)
      : 0;

    const vehicleNo = slot.vehicleNo;
    slot.isOccupied  = false;
    slot.vehicleNo   = null;
    slot.vehicleType = null;
    slot.studentName = null;
    slot.blockNo     = null;
    slot.entryTime   = null;
    await slot.save();

    res.json({
      success: true,
      message: `${vehicleNo} checked out from ${slot.slotId}`,
      duration: `${duration} min`,
      slot,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/parking/guidance/:vehicleNo — Quick guidance lookup ──────────────
router.get('/guidance/:vehicleNo', async (req, res) => {
  try {
    const slot = await ParkingSlot.findOne({
      vehicleNo: req.params.vehicleNo.toUpperCase(),
      isOccupied: true
    });

    if (!slot) return res.status(404).json({ success: false, message: 'Vehicle not found in parking' });

    res.json({
      success: true,
      slot_id: slot.slotId,
      guidance: `Your vehicle is at Zone ${slot.zone}, Slot ${slot.slotNumber}. Entry time: ${slot.entryTime?.toLocaleTimeString('en-IN')}.`,
      student_id: slot.studentId,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
