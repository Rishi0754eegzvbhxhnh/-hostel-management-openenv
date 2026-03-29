const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
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

// GET /api/rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/rooms/:id
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/rooms/book
router.post('/book', auth, async (req, res) => {
  try {
    const { roomId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!room.isAvailable || room.occupants.length >= room.capacity) {
      return res.status(400).json({ message: 'Room is already full' });
    }

    // Update room
    room.occupants.push(req.user.id);
    if (room.occupants.length >= room.capacity) room.isAvailable = false;
    await room.save();

    // Update user
    await User.findByIdAndUpdate(req.user.id, { room: roomId });

    res.json({ message: 'Room booked successfully!', room });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/rooms/seed
router.post('/seed', async (req, res) => {
  const sampleRooms = [
    { roomNumber: '302', type: 'shared', capacity: 2, pricePerMonth: 450, features: ['AC', 'Wifi', '2 Beds'] },
    { roomNumber: '303', type: 'single', capacity: 1, pricePerMonth: 600, features: ['AC', 'Wifi', '1 Bed'] },
    { roomNumber: '101', type: 'suite', capacity: 4, pricePerMonth: 1200, features: ['Kitchen', 'Balcony', 'King Size'] },
  ];
  try {
    await Room.deleteMany({});
    await Room.insertMany(sampleRooms);
    res.json({ message: 'Rooms seeded' });
  } catch (err) {
    res.status(500).json({ message: 'Error seeding rooms' });
  }
});

module.exports = router;
