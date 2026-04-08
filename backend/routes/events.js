/**
 * routes/events.js
 * Event Management System
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Event = require('../models/Event');
const User = require('../models/User');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123'); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};

// ── Seed events ─────────────────────────────────────────────────────────────
router.post('/seed', async (req, res) => {
  try {
    const count = await Event.countDocuments();
    if (count > 0) return res.json({ message: 'Already seeded', count });

    const admin = await User.findOne({ role: 'admin' });
    const events = [
      {
        title: 'Annual Hostel Fest 2026',
        description: 'Grand celebration with music, dance, and food',
        date: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        startTime: '18:00',
        endTime: '23:00',
        location: 'Hostel Grounds',
        category: 'cultural',
        organizer: admin?._id,
        capacity: 500,
        status: 'upcoming'
      },
      {
        title: 'Sports Day',
        description: 'Cricket, badminton, and athletics competitions',
        date: new Date(Date.now() + 15 * 24 * 3600 * 1000),
        startTime: '09:00',
        endTime: '17:00',
        location: 'Sports Ground',
        category: 'sports',
        organizer: admin?._id,
        capacity: 300,
        status: 'upcoming'
      },
      {
        title: 'Tech Workshop: Web Development',
        description: 'Learn modern web development with React and Node.js',
        date: new Date(Date.now() + 7 * 24 * 3600 * 1000),
        startTime: '14:00',
        endTime: '17:00',
        location: 'Study Pod A1',
        category: 'workshop',
        organizer: admin?._id,
        capacity: 50,
        status: 'upcoming'
      },
      {
        title: 'Movie Night',
        description: 'Watch latest Bollywood blockbuster with friends',
        date: new Date(Date.now() + 3 * 24 * 3600 * 1000),
        startTime: '20:00',
        endTime: '23:00',
        location: 'Common Room',
        category: 'social',
        organizer: admin?._id,
        capacity: 100,
        status: 'upcoming'
      },
      {
        title: 'Hostel Council Elections',
        description: 'Vote for your hostel representatives',
        date: new Date(Date.now() + 5 * 24 * 3600 * 1000),
        startTime: '10:00',
        endTime: '16:00',
        location: 'Main Hall',
        category: 'social',
        organizer: admin?._id,
        capacity: 200,
        status: 'upcoming'
      }
    ];

    await Event.insertMany(events);
    res.json({ success: true, message: `✅ ${events.length} events created`, count: events.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/events — All events ────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = {};

    if (category) query.category = category;
    if (status) query.status = status;

    const events = await Event.find(query)
      .populate('organizer', 'fullName email')
      .populate('attendees', 'fullName email')
      .sort({ date: 1 });

    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/events/:id — Single event details ──────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'fullName email')
      .populate('attendees', 'fullName email collegeId');

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/events — Create new event (admin) ─────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, location, category, capacity } = req.body;

    if (!title || !date || !startTime || !endTime || !location) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const event = new Event({
      title,
      description,
      date: new Date(date),
      startTime,
      endTime,
      location,
      category: category || 'social',
      organizer: req.user.id,
      capacity: capacity || 100,
      status: 'upcoming'
    });

    await event.save();
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/events/:id — Update event ──────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const { title, description, date, startTime, endTime, location, category, capacity, status } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = new Date(date);
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (location) event.location = location;
    if (category) event.category = category;
    if (capacity) event.capacity = capacity;
    if (status) event.status = status;

    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/events/:id — Delete event ──────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/events/:id/attend — Register for event ────────────────────────
router.post('/:id/attend', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    event.attendees.push(req.user.id);
    await event.save();

    res.json({ success: true, message: 'Registered for event', event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/events/:id/unattend — Unregister from event ────────────────────
router.post('/:id/unattend', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    event.attendees = event.attendees.filter(id => id.toString() !== req.user.id);
    await event.save();

    res.json({ success: true, message: 'Unregistered from event', event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
