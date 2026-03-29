const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const FoodMenu = require('../models/FoodMenu');
const Complaint = require('../models/Complaint');
const LaundryStatus = require('../models/LaundryStatus');
const EnergyUsage = require('../models/EnergyUsage');

router.get('/context', async (req, res) => {
  try {
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

    const context = {
      rooms: {
        total: rooms.length,
        available: availableRooms,
        priceRange: "₹450 - ₹1200",
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
        status: laundry.map(m => ({ machine: m.machineNumber, status: m.status, remaining: m.timeRemaining }))
      },
      infrastructure: {
        energy: energy.reduce((sum, e) => sum + e.currentUsage, 0),
        blocks: energy.map(e => ({ block: e.block, usage: e.currentUsage, status: e.status }))
      }
    };

    res.json(context);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching AI context' });
  }
});

module.exports = router;
