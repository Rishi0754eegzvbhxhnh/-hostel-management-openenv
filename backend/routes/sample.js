/**
 * routes/sample.js
 * ================
 * All /api/sample/... endpoints used by AdminDashboard and FoodMenu.jsx.
 * Also handles random Indian mess menu generation & storage.
 */
const express = require('express');
const router  = express.Router();
const User        = require('../models/User');
const Transaction = require('../models/Transaction');
const Room        = require('../models/Room');
const FoodMenu    = require('../models/FoodMenu');
const notificationService = require('../services/notificationService');

// ── Indian Mess Menu Pool ────────────────────────────────────────────────────
const MENU_POOL = {
  breakfast: [
    ['Poha', 'Jalebi', 'Chai'],
    ['Idli', 'Sambar', 'Coconut Chutney'],
    ['Aloo Paratha', 'Curd', 'Pickle'],
    ['Upma', 'Coconut Chutney', 'Banana'],
    ['Bread Butter', 'Omelette', 'Chai'],
    ['Puri Bhaji', 'Lassi'],
    ['Dosa', 'Sambar', 'Red Chutney'],
    ['Moong Dal Chilla', 'Curd', 'Chai'],
    ['Besan Cheela', 'Green Chutney', 'Juice'],
    ['Rava Idli', 'Tomato Chutney', 'Coffee'],
    ['Aloo Methi Paratha', 'Butter', 'Curd'],
    ['Sevai Upma', 'Groundnut Chutney', 'Chai'],
    ['Paneer Stuffed Paratha', 'Pickle', 'Lassi'],
  ],
  lunch: [
    ['Dal Tadka', 'Jeera Rice', 'Roti', 'Salad', 'Papad'],
    ['Rajma Chawal', 'Roti', 'Pickle', 'Buttermilk'],
    ['Chole Bhature', 'Onion Salad', 'Pickle'],
    ['Palak Paneer', 'Rice', 'Roti', 'Raita'],
    ['Aloo Gobi', 'Dal', 'Rice', 'Roti'],
    ['Kadai Paneer', 'Naan', 'Jeera Rice', 'Raita'],
    ['Vegetable Biryani', 'Raita', 'Papad'],
    ['Mixed Veg Curry', 'Dal', 'Rice', 'Roti'],
    ['Baingan Bharta', 'Dal Makhani', 'Chapati', 'Rice'],
    ['Matar Mushroom', 'Pulao', 'Roti', 'Salad'],
    ['Sambar Rice', 'Papad', 'Pickle', 'Buttermilk'],
    ['Chana Masala', 'Poori', 'Salad'],
    ['Pav Bhaji', 'Salad', 'Mango Pickle'],
    ['South Indian Thali — Sambar, Rasam, Rice, Papad, Raita'],
  ],
  dinner: [
    ['Paneer Butter Masala', 'Garlic Naan', 'Jeera Rice', 'Salad'],
    ['Dal Makhani', 'Roti', 'Rice', 'Gajar Halwa'],
    ['Veg Pulao', 'Raita', 'Shahi Paneer', 'Roti'],
    ['Bhindi Masala', 'Dal Fry', 'Chapati', 'Rice'],
    ['Roti', 'Aloo Mutter', 'Dal', 'Rice', 'Salad'],
    ['Methi Thepla', 'Curd', 'Dal Soup', 'Rice'],
    ['Pasta in Red Sauce', 'Garlic Bread', 'Salad'],
    ['Veg Manchurian', 'Fried Rice', 'Spring Rolls'],
    ['Malai Kofta', 'Butter Naan', 'Jeera Rice'],
    ['Mix Veg Halwa', 'Khichdi', 'Kadhi', 'Papad'],
    ['Lauki Kofta', 'Dal Tadka', 'Rice', 'Roti'],
    ['Egg Curry', 'Rice', 'Roti', 'Salad'],
    ['Fish Curry', 'Steamed Rice', 'Roti', 'Salad'],
    ['Chicken Curry', 'Rice', 'Roti', 'Raita'],
  ],
};

const DAYS    = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const TIMES   = { breakfast: '7:30 AM – 9:00 AM', lunch: '12:30 PM – 2:00 PM', dinner: '7:30 PM – 9:00 PM' };
const IMAGES  = {
  breakfast: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600',
  lunch:     'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600',
  dinner:    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600',
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateRandomMenu() {
  const menu = {};
  for (const day of DAYS) {
    menu[day] = {
      breakfast: { items: pick(MENU_POOL.breakfast), time: TIMES.breakfast, image: IMAGES.breakfast },
      lunch:     { items: pick(MENU_POOL.lunch),     time: TIMES.lunch,     image: IMAGES.lunch },
      dinner:    { items: pick(MENU_POOL.dinner),     time: TIMES.dinner,     image: IMAGES.dinner },
    };
  }
  return menu;
}

// ── GET /api/sample/menu ─────────────────────────────────────────────────────
// Returns current week menu from DB, or generates + saves a fresh random one
router.get('/menu', async (req, res) => {
  try {
    const existing = await FoodMenu.find({});

    // If the DB has a proper structured menu, return it
    if (existing.length > 0 && existing[0].menuData) {
      return res.json({ success: true, data: existing[0].menuData });
    }

    // Otherwise generate a random menu and persist it
    const menuData = generateRandomMenu();
    await FoodMenu.deleteMany({});
    await FoodMenu.create({ day: 'week', menuData, updatedAt: new Date() });

    res.json({ success: true, data: menuData });
  } catch (err) {
    // Fallback: return static random menu even if DB fails
    res.json({ success: true, data: generateRandomMenu(), fallback: true });
  }
});

// ── POST /api/sample/menu/randomize ─────────────────────────────────────────
// Admin button: generate completely new random menu and save to DB
router.post('/menu/randomize', async (req, res) => {
  try {
    const menuData = generateRandomMenu();
    await FoodMenu.deleteMany({});
    await FoodMenu.create({ day: 'week', menuData });
    res.json({ success: true, message: '🎲 New random menu generated!', data: menuData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/sample/transactions ─────────────────────────────────────────────
router.get('/transactions', async (req, res) => {
  try {
    const txns = await Transaction.find()
      .populate('student', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(20);

    const data = txns.map(t => ({
      id: t._id,
      studentName: t.studentName || t.student?.fullName || 'Unknown',
      email: t.student?.email || '',
      amount: t.amount,
      type: t.paymentType,
      title: t.title,
      status: t.status,
      room: t.room,
      date: t.createdAt,
      referenceNo: t.referenceNo,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/sample/bookings ─────────────────────────────────────────────────
router.get('/bookings', async (req, res) => {
  try {
    const students = await User.find({ role: 'student', room: { $exists: true, $ne: null } })
      .populate('room')
      .limit(15);

    const data = students.map(s => ({
      id: s._id,
      studentName: s.fullName,
      email: s.email,
      room: s.room?.roomNumber || '—',
      type: s.room?.type || 'single',
      checkIn: s.createdAt,
      status: 'active',
      amount: s.room?.type === 'triple' ? 4500 : s.room?.type === 'double' ? 6000 : 8000,
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/sample/students ─────────────────────────────────────────────────
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).limit(20);
    const data = students.map(s => ({
      id: s._id,
      studentName: s.fullName,
      email: s.email,
      phone: s.phone,
      collegeId: s.collegeId,
      room: s.room || '—',
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/sample/pending-fees ─────────────────────────────────────────────
router.get('/pending-fees', async (req, res) => {
  try {
    const pending = await Transaction.find({ status: 'pending' })
      .populate('student', 'fullName email phone')
      .sort({ createdAt: 1 });

    const now = new Date();
    const data = pending.map(t => {
      const days = Math.floor((now - new Date(t.createdAt)) / (1000 * 3600 * 24));
      return {
        id: t._id,
        studentId: t.student?._id,
        studentName: t.studentName || t.student?.fullName,
        email: t.student?.email || '',
        phone: t.student?.phone || '',
        room: t.room,
        amount: t.amount,
        daysOverdue: days,
        lateFee: days > 30 ? Math.floor(t.amount * 0.02 * Math.floor(days / 30)) : 0,
        type: t.paymentType,
        reminderCount: 0,
        lastReminder: null,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/sample/auto-notify-overdue ─────────────────────────────────────
router.post('/auto-notify-overdue', async (req, res) => {
  try {
    const { channel = 'email' } = req.body;
    const overdue = await Transaction.find({ status: 'pending' })
      .populate('student', 'fullName email phone');

    if (!overdue.length) {
      return res.json({ success: true, sent: 0, failed: 0, message: 'No overdue fees found', results: [] });
    }

    const results = [];
    for (const t of overdue.slice(0, 5)) { // cap at 5 auto-sends
      try {
        await notificationService.sendFeeReminder({
          studentName: t.studentName || t.student?.fullName || 'Student',
          studentEmail: t.student?.email,
          phone: t.student?.phone,
          roomNumber: t.room,
          amount: t.amount,
          daysOverdue: Math.floor((Date.now() - new Date(t.createdAt)) / 86400000),
          lateFee: 0,
          channel,
        });
        results.push({ studentName: t.studentName, ok: true });
      } catch {
        results.push({ studentName: t.studentName, ok: false });
      }
    }

    const sent   = results.filter(r => r.ok).length;
    const failed = results.length - sent;
    res.json({ success: true, sent, failed, message: `Notified ${sent} students`, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Static Sample Data (Hardcoded) ──────────────────────────────────────────
const STATIC_HOSTELS = [
  { id: 'H001', name: 'Green Valley PG', city: 'Bangalore', address: 'HSR Layout, Sector 2', rating: 4.5, price: 6500, forGender: 'Girls', images: { cover: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200', gallery: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'] }, facilities: ['AC', 'WiFi', 'Meals', 'Laundry', 'Security'], amenities: { bathrooms: 4, washingMachines: 2, dryingArea: true, terrace: true, lift: true }, acSupport: true, foodIncluded: true, securityLevel: 'High', distance: '2 km' },
  { id: 'H002', name: 'Sunrise Residency', city: 'Mumbai', address: 'Andheri East, Near Metro', rating: 4.2, price: 8000, forGender: 'Boys', images: { cover: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200', gallery: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'] }, facilities: ['AC', 'WiFi', 'Meals', 'Gym', 'Parking'], amenities: { bathrooms: 6, washingMachines: 3, dryingArea: true, terrace: true, lift: true }, acSupport: true, foodIncluded: true, securityLevel: 'Very High', distance: '1.5 km' },
  { id: 'H003', name: 'Student Nest', city: 'Delhi', address: 'North Campus, Delhi University', rating: 4.7, price: 5500, forGender: 'Both', images: { cover: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200', gallery: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600'] }, facilities: ['WiFi', 'Meals', 'Study Room', 'Library'], amenities: { bathrooms: 5, washingMachines: 2, dryingArea: true, terrace: false, lift: false }, acSupport: false, foodIncluded: true, securityLevel: 'Medium', distance: '500m' },
  { id: 'H004', name: 'Cozy Stay', city: 'Hyderabad', address: 'Gachibowli, Near IT Hub', rating: 4.3, price: 7000, forGender: 'Girls', images: { cover: 'https://images.unsplash.com/photo-1598928506311-c55ez331f9a0?w=1200', gallery: ['https://images.unsplash.com/photo-1598928506311-c55ez331f9a0?w=600'] }, facilities: ['AC', 'WiFi', 'Meals', 'Hot Water', 'Housekeeping'], amenities: { bathrooms: 4, washingMachines: 2, dryingArea: true, terrace: true, lift: true }, acSupport: true, foodIncluded: true, securityLevel: 'High', distance: '3 km' },
  { id: 'H005', name: 'Urban Living', city: 'Pune', address: 'Kothrud, Near MIT Campus', rating: 4.6, price: 6000, forGender: 'Boys', images: { cover: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', gallery: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600'] }, facilities: ['WiFi', 'Meals', 'Sports Area', 'Garden'], amenities: { bathrooms: 5, washingMachines: 3, dryingArea: true, terrace: true, lift: false }, acSupport: false, foodIncluded: true, securityLevel: 'High', distance: '1 km' },
  { id: 'H006', name: 'Royal PG', city: 'Chennai', address: 'Anna Nagar, Near College', rating: 4.4, price: 5800, forGender: 'Girls', images: { cover: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=1200', gallery: ['https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=600'] }, facilities: ['AC', 'WiFi', 'Meals', 'Vegetarian', 'Parking'], amenities: { bathrooms: 4, washingMachines: 2, dryingArea: true, terrace: true, lift: true }, acSupport: true, foodIncluded: true, securityLevel: 'High', distance: '800m' }
];

const STATIC_ROOMS = [
  { id: 'R001', roomNumber: '101', floor: 1, type: 'single', price: 5500, size: '12x14 sqft', capacity: 1, currentOccupancy: 1, ac: true, attachedBathroom: true, windowView: 'Garden View', amenities: ['Bed', 'Study Table', 'Wardrobe', 'Fan', 'AC', 'WiFi'], images: { main: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', gallery: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'] }, has360View: true },
  { id: 'R002', roomNumber: '102', floor: 1, type: 'shared', price: 4000, size: '14x16 sqft', capacity: 2, currentOccupancy: 2, ac: false, attachedBathroom: false, windowView: 'Street View', amenities: ['Bed x2', 'Study Table x2', 'Wardrobe x2', 'Fan', 'WiFi'], images: { main: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', gallery: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600'] }, has360View: false },
  { id: 'R003', roomNumber: '201', floor: 2, type: 'single', price: 6000, size: '12x14 sqft', capacity: 1, currentOccupancy: 0, ac: true, attachedBathroom: true, windowView: 'Pool View', amenities: ['Bed', 'Study Table', 'Wardrobe', 'AC', 'WiFi', 'Mini Fridge'], images: { main: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', gallery: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'] }, has360View: true }
];

const STATIC_FACILITIES = {
  bathrooms: [{ id: 'B001', floor: 1, type: 'attached', images: ['https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600'] }, { id: 'B002', floor: 1, type: 'common', images: ['https://images.unsplash.com/photo-1620626011761-996317702508?w=600'] }],
  washingMachines: [{ id: 'WM001', location: 'Ground Floor', type: 'automatic', capacity: '7kg', status: 'available', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600' }, { id: 'WM002', location: 'Ground Floor', type: 'automatic', capacity: '7kg', status: 'in_use', image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600' }],
  dryingAreas: [{ id: 'DA001', location: 'Terrace', floor: 4, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], hasClothLines: true, hasHangers: true }],
  terraces: [{ id: 'T001', floor: 4, size: '2000 sqft', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], facilities: ['Sitting Area', 'Garden', 'Cloth Drying'] }],
  commonAreas: [{ id: 'CA001', name: 'Washing Area', images: ['https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800'], location: 'Ground Floor' }, { id: 'CA002', name: 'Study Hall', images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'], location: 'Second Floor', capacity: 30 }],
  lifts: { available: true, floors: [1, 2, 3, 4, 5], capacity: '6 persons' },
  security: { cctv: true, cctvCount: 24, securityGuard: true, guardTiming: '24/7', biometricEntry: true, fireSafety: true },
  sanitation: { cleaningSchedule: 'Daily', lastPestControl: '2026-03-01', garbageCollection: 'Twice daily', waterSupply: '24/7 Borewell' }
};

const STATIC_NOTIFICATIONS = [
  { id: 'N001', studentName: 'Amit Singh', email: 'amit@email.com', phone: '+919876543210', type: 'payment_reminder', message: 'Rent payment of ₹4000 is due for March 2026', sentVia: ['email', 'sms'], status: 'delivered' },
  { id: 'N002', studentName: 'Rahul Kumar', email: 'rahul@email.com', phone: '+919876543211', type: 'payment_reminder', message: 'Electricity bill of ₹450 is due', sentVia: ['email'], status: 'delivered' },
  { id: 'N003', studentName: 'Priya Sharma', email: 'priya@email.com', phone: '+919876543212', type: 'maintenance', message: 'Water tank cleaning scheduled for March 30', sentVia: ['sms'], status: 'pending' }
];

const STATIC_STUDENTS = [
  { id: 'STU001', name: 'Rahul Kumar', email: 'rahul.kumar@email.com', phone: '+919876543211', college: 'RV College of Engineering', course: 'B.Tech', year: 3, profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { id: 'STU002', name: 'Priya Sharma', email: 'priya.sharma@email.com', phone: '+919876543212', college: 'Christ University', course: 'MBA', year: 2, profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  { id: 'STU003', name: 'Amit Singh', email: 'amit.singh@email.com', phone: '+919876543210', college: 'IIT Bangalore', course: 'M.Tech', year: 1, profilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
  { id: 'STU004', name: 'Neha Patel', email: 'neha.patel@email.com', phone: '+919876543214', college: 'NIT Surathkal', course: 'B.Tech', year: 2, profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
  { id: 'STU005', name: 'Vikram Reddy', email: 'vikram.reddy@email.com', phone: '+919876543213', college: 'VIT Vellore', course: 'B.Tech', year: 4, profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
  { id: 'STU006', name: 'Sneha Gupta', email: 'sneha.gupta@email.com', phone: '+919876543215', college: 'BMS College of Engineering', course: 'B.Arch', year: 3, profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200' },
  { id: 'STU007', name: 'Arjun Nair', email: 'arjun.nair@email.com', phone: '+919876543216', college: 'SRM University', course: 'MBBS', year: 2, profilePic: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200' },
  { id: 'STU008', name: 'Kavya Nair', email: 'kavya.nair@email.com', phone: '+919876543217', college: 'Anna University', course: 'B.E', year: 1, profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }
];

// ── GET /api/sample/hostels ────────────────────────────────────────────────────
router.get('/hostels', (req, res) => {
  res.json({ success: true, data: STATIC_HOSTELS });
});

// ── GET /api/sample/hostels/:city ────────────────────────────────────────────
router.get('/hostels/:city', (req, res) => {
  const city = req.params.city.toLowerCase();
  const hostels = STATIC_HOSTELS.filter(h => h.city.toLowerCase() === city);
  res.json({ success: true, city, data: hostels });
});

// ── GET /api/sample/rooms ─────────────────────────────────────────────────────
router.get('/rooms', (req, res) => {
  res.json({ success: true, data: STATIC_ROOMS });
});

// ── GET /api/sample/facilities ────────────────────────────────────────────────
router.get('/facilities', (req, res) => {
  res.json({ success: true, data: STATIC_FACILITIES });
});

// ── GET /api/sample/notifications ────────────────────────────────────────────
router.get('/notifications', (req, res) => {
  res.json({ success: true, data: STATIC_NOTIFICATIONS });
});

// ── GET /api/sample/students/static ─────────────────────────────────────────
router.get('/students/static', (req, res) => {
  res.json({ success: true, data: STATIC_STUDENTS });
});

// ── GET /api/sample/dashboard-stats ──────────────────────────────────────────
router.get('/dashboard-stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalRooms: STATIC_ROOMS.length,
      occupiedRooms: STATIC_ROOMS.filter(r => r.currentOccupancy > 0).length,
      availableRooms: STATIC_ROOMS.filter(r => r.currentOccupancy < r.capacity).length,
      occupancyRate: 67,
      totalStudents: STATIC_STUDENTS.length,
      pendingAmount: 15950,
      pendingCount: 4,
      hostelsCount: STATIC_HOSTELS.length,
      citiesCount: [...new Set(STATIC_HOSTELS.map(h => h.city))].length
    }
  });
});

module.exports = router;
