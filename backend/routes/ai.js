const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const FoodMenu = require('../models/FoodMenu');
const Complaint = require('../models/Complaint');
const LaundryStatus = require('../models/LaundryStatus');
const EnergyUsage = require('../models/EnergyUsage');
const aiService = require('../services/aiService');

/**
 * Helper to fetch consolidated hostel context
 */
const getHostelContext = async () => {
  const [rooms, menu, complaints, laundry, energy] = await Promise.all([
    Room.find(),
    FoodMenu.find(),
    Complaint.countDocuments({ status: 'pending' }),
    LaundryStatus.find(),
    EnergyUsage.find()
  ]);

  const availableRooms = rooms.filter(r => r.isAvailable).length;
  const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
  const todayMenu = menu.find(m => m.day === today) || menu[0];

  return {
    rooms: {
      total: rooms.length,
      available: availableRooms,
      priceRange: "₹4500 - ₹12000",
    },
    food: {
      today: today,
      menu: todayMenu,
    },
    stats: {
      pendingComplaints: complaints,
    },
    laundry: {
      total: laundry.length,
      available: laundry.filter(m => m.status === 'idle').length,
    },
    infrastructure: {
      energy: energy.reduce((sum, e) => sum + e.currentUsage, 0),
    }
  };
};

router.get('/context', async (req, res) => {
  try {
    const context = await getHostelContext();
    res.json(context);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching AI context' });
  }
});

router.post('/chat', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, message: 'Query required' });
  }

  try {
    const context = await getHostelContext();
    const systemPrompt = `You are Aria, the intelligent AI assistant for a modern student hostel. 
Your goal is to help students with their daily hostel life. 
Be helpful, concise, and friendly. 
When asked about specific amenities (food, rooms, laundry), use the provided context data to give accurate answers.
If you don't have specific data in the context, give a general helpful response but mention you are basing it on standard hostel procedures.
Keep responses under 100 words.`;

    const result = await aiService.generateChatResponse(query, context, systemPrompt);
    res.json(result);
  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
