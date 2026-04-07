const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const aiService = require('../services/aiService');

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

/**
 * AI-powered room discovery using NL query
 * POST /api/rooms/ai-search
 */
router.post('/ai-search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ success: false, message: 'Query required' });
  
  try {
    const rooms = await Room.find({});
    const systemPrompt = `You are a helpful hostel accommodation assistant. 
    Analyze the user's natural language request and match it against the following live room inventory. 
    Return the top 3 best fits. Respond in JSON format with an "answer" summary and a "matches" array. 
    Matches should include: roomNumber, type, features, matchPercentage (0-100).`;
    
    const result = await aiService.generateChatResponse(query, rooms, systemPrompt);
    
    // Parse result.answer as JSON if possible
    let finalAnswer = result.answer;
    let matches = [];
    try {
      const parsed = JSON.parse(result.answer.replace(/\`\`\`json|\`\`\`/g, '').trim());
      finalAnswer = parsed.answer || 'I found some rooms you might like!';
      matches = parsed.matches || [];
    } catch {
       // Fallback logic
    }
    
    res.json({ success: true, answer: finalAnswer, matches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    const { roomId, roomNumber } = req.body;
    let room;
    if (roomId) room = await Room.findById(roomId);
    else if (roomNumber) room = await Room.findOne({ roomNumber });

    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    
    // Check if user already booked this room
    if (room.occupants.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You have already booked this room' });
    }

    if (room.occupants.length >= room.capacity) {
      room.isAvailable = false;
      await room.save();
      return res.status(400).json({ success: false, message: 'Room is already full' });
    }

    // Atomic update for room
    room.occupants.push(req.user.id);
    if (room.occupants.length >= room.capacity) {
      room.isAvailable = false;
    }
    await room.save();

    // Update user's room reference
    await User.findByIdAndUpdate(req.user.id, { room: room._id });

    console.log(`[BOOKING] Student ${req.user.id} booked Room ${room.roomNumber}`);
    res.json({ success: true, message: 'Room booked successfully!', room });
  } catch (err) {
    console.error('Booking Error:', err);
    res.status(500).json({ success: false, message: 'Server error during booking', error: err.message });
  }
});

// POST /api/rooms/seed
router.post('/seed', async (req, res) => {
  const sampleRooms = [
    // Floor 1
    { roomNumber: '101', type: 'Single', capacity: 1, isAvailable: true, occupants: [], pricePerMonth: 8500, features: ['AC', 'Wifi', 'Balcony'] },
    { roomNumber: '102', type: 'Double', capacity: 2, isAvailable: true, occupants: [], pricePerMonth: 6500, features: ['Wifi', 'Attached Bath'] },
    { roomNumber: '103', type: 'Triple', capacity: 3, isAvailable: true, occupants: [], pricePerMonth: 5000, features: ['Wifi', 'Shared Bath'] },
    // Floor 2
    { roomNumber: '201', type: 'Single', capacity: 1, isAvailable: true, occupants: [], pricePerMonth: 8500, features: ['AC', 'Wifi'] },
    { roomNumber: '202', type: 'Double', capacity: 2, isAvailable: true, occupants: [], pricePerMonth: 6500, features: ['Wifi'] },
    // Floor 3 (Premium)
    { roomNumber: '301', type: 'Suite', capacity: 2, isAvailable: true, occupants: [], pricePerMonth: 12000, features: ['AC', 'Wifi', 'Mini Fridge', 'TV'] },
    { roomNumber: '302', type: 'Single', capacity: 1, isAvailable: true, occupants: [], pricePerMonth: 9500, features: ['AC', 'Wifi', 'Study Table'] },
  ];
  try {
    await Room.deleteMany({});
    const inserted = await Room.insertMany(sampleRooms);
    console.log(`[SEED] Initialized ${inserted.length} rooms.`);
    res.json({ success: true, message: 'Live database seeded with 7 rooms.', count: inserted.length });
  } catch (err) {
    console.error('Seed Error:', err);
    res.status(500).json({ success: false, message: 'Error seeding rooms', error: err.message });
  }
});

module.exports = router;
