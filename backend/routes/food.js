const express = require('express');
const router = express.Router();
const FoodMenu = require('../models/FoodMenu');

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menu = await FoodMenu.find({});
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching menu' });
  }
});

// Update a menu item (Admin only in real app)
router.post('/update', async (req, res) => {
  try {
    const { day, breakfast, lunch, dinner } = req.body;
    let menuItem = await FoodMenu.findOne({ day });

    if (menuItem) {
      menuItem.breakfast = breakfast;
      menuItem.lunch = lunch;
      menuItem.dinner = dinner;
      await menuItem.save();
    } else {
      menuItem = new FoodMenu({ day, breakfast, lunch, dinner });
      await menuItem.save();
    }

    res.json({ message: 'Menu updated successfully', menuItem });
  } catch (err) {
    res.status(500).json({ message: 'Error updating menu' });
  }
});

// Seed some data if empty
router.post('/seed', async (req, res) => {
  const sampleData = [
    { day: 'Monday', breakfast: 'Pancakes', lunch: 'Rice & Curry', dinner: 'Tacos' },
    { day: 'Tuesday', breakfast: 'Oatmeal', lunch: 'Pasta', dinner: 'Grilled Chicken' },
    { day: 'Wednesday', breakfast: 'Fruit bowl', lunch: 'Salad', dinner: 'Steak' },
    { day: 'Thursday', breakfast: 'Eggs', lunch: 'Burger', dinner: 'Pizza' },
    { day: 'Friday', breakfast: 'Toast', lunch: 'Sushi', dinner: 'Soup' },
  ];

  try {
    await FoodMenu.deleteMany({});
    await FoodMenu.insertMany(sampleData);
    res.json({ message: 'Database seeded with sample menu items' });
  } catch (err) {
    res.status(500).json({ message: 'Error seeding data' });
  }
});

module.exports = router;
