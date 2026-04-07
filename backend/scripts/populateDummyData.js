const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from one level up
dotenv.config({ path: path.join(__dirname, '../.env') });

const Room = require('../models/Room');
const LaundryStatus = require('../models/LaundryStatus');
const EnergyUsage = require('../models/EnergyUsage');
const FoodMenu = require('../models/FoodMenu');

const MONGO_URI = process.env.MONGO_URI;

const populate = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // 1. Seed Rooms
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      const rooms = [];
      for (let i = 1; i <= 20; i++) {
        const type = i <= 5 ? 'suite' : (i <= 10 ? 'single' : 'shared');
        rooms.push({
          roomNumber: `${100 + i}`,
          type,
          capacity: type === 'shared' ? 3 : 1,
          pricePerMonth: type === 'suite' ? 12000 : (type === 'single' ? 8500 : 5500),
          isAvailable: i % 4 !== 0,
          features: type === 'suite' ? ['AC', 'Balcony', 'Attached Bath'] : ['WiFi', 'Study Table'],
        });
      }
      await Room.insertMany(rooms);
      console.log('✅ Rooms seeded');
    }

    // 2. Seed Laundry
    const laundryCount = await LaundryStatus.countDocuments();
    if (laundryCount === 0) {
      const machines = [];
      for (let i = 1; i <= 6; i++) {
        machines.push({
          machineNumber: i,
          status: i % 3 === 0 ? 'running' : 'idle',
          timeRemaining: i % 3 === 0 ? Math.floor(Math.random() * 45) + 5 : 0,
        });
      }
      await LaundryStatus.insertMany(machines);
      console.log('✅ Laundry machines seeded');
    }

    // 3. Seed Energy
    const energyCount = await EnergyUsage.countDocuments();
    if (energyCount === 0) {
      const blocks = ['A', 'B', 'C', 'D'];
      const usage = blocks.map(b => ({
        block: `Block ${b}`,
        currentUsage: Math.floor(Math.random() * 500) + 200,
        status: 'normal'
      }));
      await EnergyUsage.insertMany(usage);
      console.log('✅ Energy usage seeded');
    }

    // 4. Seed Food Menu
    const menuCount = await FoodMenu.countDocuments();
    if (menuCount === 0) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dishes = {
        breakfast: ['Poha', 'Aloo Paratha', 'Idli Sambhar', 'Bread Omelette', 'Puri Sabzi', 'Oats', 'Dosa'],
        lunch: ['Rajma Chawal', 'Paneer Butter Masala', 'Veg Thali', 'Chicken Biryani', 'Dal Makhani', 'Kadai Veg', 'Mixed Veg'],
        dinner: ['Dal Tadka', 'Egg Curry', 'Malai Kofta', 'Fish Fry', 'Mushroom Masala', 'Bhindi Masala', 'Spiced Paneer']
      };

      const menus = days.map((day, i) => ({
        day,
        breakfast: dishes.breakfast[i],
        lunch: dishes.lunch[i],
        dinner: dishes.dinner[i],
      }));
      await FoodMenu.insertMany(menus);
      console.log('✅ Food menu seeded');
    }

    console.log('✨ All dummy data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
};

populate();
