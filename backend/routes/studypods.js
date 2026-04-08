/**
 * routes/studypods.js
 * Study Pod Management System
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { StudyPod, StudyPodBooking } = require('../models/StudyPod');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123'); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};

// ── Seed study pods ─────────────────────────────────────────────────────────
router.post('/seed', async (req, res) => {
  try {
    const count = await StudyPod.countDocuments();
    if (count > 0) return res.json({ message: 'Already seeded', count });

    const pods = [
      { podName: 'Pod A1', block: 'Block A', capacity: 4, amenities: ['WiFi', 'Whiteboard', 'AC'] },
      { podName: 'Pod A2', block: 'Block A', capacity: 4, amenities: ['WiFi', 'Whiteboard', 'AC'] },
      { podName: 'Pod B1', block: 'Block B', capacity: 6, amenities: ['WiFi', 'Projector', 'AC', 'Charging'] },
      { podName: 'Pod B2', block: 'Block B', capacity: 6, amenities: ['WiFi', 'Projector', 'AC', 'Charging'] },
      { podName: 'Pod C1', block: 'Block C', capacity: 2, amenities: ['WiFi', 'Quiet Zone'] },
      { podName: 'Pod C2', block: 'Block C', capacity: 2, amenities: ['WiFi', 'Quiet Zone'] },
    ];

    await StudyPod.insertMany(pods);
    res.json({ success: true, message: `✅ ${pods.length} study pods created`, count: pods.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/studypods — All pods with availability ────────────────────────
router.get('/', async (req, res) => {
  try {
    const pods = await StudyPod.find();
    const podsWithBookings = await Promise.all(pods.map(async (pod) => {
      const bookings = await StudyPodBooking.countDocuments({
        pod: pod._id,
        startTime: { $lte: new Date() },
        endTime: { $gte: new Date() }
      });
      return {
        ...pod.toObject(),
        currentBookings: bookings,
        availableSeats: pod.capacity - bookings
      };
    }));

    res.json({ success: true, pods: podsWithBookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/studypods/:id — Single pod details ────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const pod = await StudyPod.findById(req.params.id);
    if (!pod) return res.status(404).json({ success: false, message: 'Pod not found' });

    const bookings = await StudyPodBooking.find({ pod: pod._id }).populate('user', 'fullName email');
    res.json({ success: true, pod, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/studypods — Create new pod (admin) ────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { podName, block, capacity, amenities } = req.body;
    if (!podName || !block) return res.status(400).json({ success: false, message: 'Pod name and block required' });

    const pod = new StudyPod({ podName, block, capacity: capacity || 4, amenities: amenities || [] });
    await pod.save();
    res.status(201).json({ success: true, pod });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/studypods/:id/book — Book a study pod ────────────────────────
router.post('/:id/book', auth, async (req, res) => {
  try {
    const { startTime, endTime, purpose } = req.body;
    if (!startTime || !endTime) return res.status(400).json({ success: false, message: 'Start and end time required' });

    const pod = await StudyPod.findById(req.params.id);
    if (!pod) return res.status(404).json({ success: false, message: 'Pod not found' });

    const booking = new StudyPodBooking({
      pod: pod._id,
      user: req.user.id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      purpose: purpose || 'Study'
    });

    await booking.save();
    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/studypods/:id/book/:bookingId — Cancel booking ──────────────
router.delete('/:id/book/:bookingId', auth, async (req, res) => {
  try {
    const booking = await StudyPodBooking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    await StudyPodBooking.findByIdAndDelete(req.params.bookingId);
    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
