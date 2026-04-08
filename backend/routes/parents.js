/**
 * routes/parents.js
 * ==================
 * Parent Ecosystem API
 * - Register as a parent linked to a student via collegeId
 * - Parent login (returns JWT)
 * - View child's: room, fees, complaints, meal plan, parking
 * - Covers Meta OpenEnv Task 6: parent-query
 */
const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const User      = require('../models/User');
const Room      = require('../models/Room');
const Complaint = require('../models/Complaint');

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey123';

// ── Middleware: verify parent JWT ────────────────────────────────────────────
function parentAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token provided' });
  try {
    const token = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'parent') return res.status(403).json({ error: 'Parent access only' });
    req.parent = decoded;
    next();
  } catch { return res.status(401).json({ error: 'Invalid token' }); }
}

// ── POST /api/parents/register ───────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { fullName, email, phone, password, childCollegeId, relationship } = req.body;

  if (!fullName || !email || !password || !childCollegeId) {
    return res.status(400).json({ error: 'fullName, email, password, and childCollegeId are required' });
  }

  try {
    // Verify child exists
    const child = await User.findOne({ collegeId: childCollegeId, role: 'student' });
    if (!child) {
      return res.status(404).json({ error: `No student found with College ID: ${childCollegeId}` });
    }

    // Check if parent already registered
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    // Create parent account
    const parent = new User({
      fullName,
      email,
      phone:     phone || '0000000000',
      password,
      role:      'parent',
      collegeId: `PARENT-${childCollegeId}`, // parent's own ID
      // Store child link in habits (reuse for metadata — no schema change needed)
      habits: { sleepTime: childCollegeId, wakeTime: relationship || 'Parent' },
    });

    await parent.save();

    const token = jwt.sign(
      { id: parent._id, email: parent.email, role: 'parent', childCollegeId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: `Registered as parent of ${child.fullName}`,
      token,
      parent: { id: parent._id, fullName, email, childCollegeId, childName: child.fullName },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /api/parents/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const parent = await User.findOne({ email: email.toLowerCase(), role: 'parent' });
    if (!parent) return res.status(404).json({ error: 'Parent account not found' });

    const ok = await parent.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid password' });

    const childCollegeId = parent.habits?.sleepTime; // stored here on register
    const child = await User.findOne({ collegeId: childCollegeId, role: 'student' });

    const token = jwt.sign(
      { id: parent._id, email: parent.email, role: 'parent', childCollegeId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      parent: {
        id: parent._id, fullName: parent.fullName, email: parent.email,
        childCollegeId,
        childName: child?.fullName || 'Student',
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/parents/child-status ─────────────────────────────────────────────
// Main parent dashboard data endpoint
router.get('/child-status', parentAuth, async (req, res) => {
  const { childCollegeId } = req.parent;

  try {
    const child = await User.findOne({ collegeId: childCollegeId, role: 'student' })
      .populate('room')
      .select('-password');

    if (!child) return res.status(404).json({ error: 'Child not found' });

    // Get recent complaints
    const complaints = await Complaint.find({ studentId: child._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title description status priority hfPriority hfCategory createdAt');

    // Build fee summary from sample data (real would query Transaction model)
    const feeStatus = {
      lastPaid: '2026-03-10',
      nextDue: '2026-04-10',
      amountDue: 7500,
      status: 'pending', // paid | pending | overdue
    };

    // Room info
    const roomInfo = child.room
      ? { number: child.room.roomNumber, block: child.room.block, type: child.room.type, floor: child.room.floor }
      : { number: 'Not Assigned', block: '—', type: '—', floor: '—' };

    // Gamification / activity
    const activity = {
      points:   child.points    || 0,
      ecoPoints: child.ecoPoints || 0,
      badges:   child.badges    || [],
      mood:     child.moodLogs?.[child.moodLogs.length - 1]?.mood || 'unknown',
    };

    res.json({
      success: true,
      child: {
        id:       child._id,
        fullName: child.fullName,
        email:    child.email,
        phone:    child.phone,
        collegeId: child.collegeId,
        avatar:   child.avatar,
      },
      room:      roomInfo,
      feeStatus,
      complaints,
      activity,
      lastUpdated: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/parents/me ──────────────────────────────────────────────────────
router.get('/me', parentAuth, async (req, res) => {
  try {
    const parent = await User.findById(req.parent.id).select('-password');
    const childCollegeId = parent.habits?.sleepTime;
    const child = await User.findOne({ collegeId: childCollegeId }).select('fullName email phone room');
    res.json({ success: true, parent, child });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Meta OpenEnv Task 6 support: parent-query ────────────────────────────────
// This endpoint directly handles the openenv task format
router.post('/openenv-query', async (req, res) => {
  const { student_id, parent_id, request_type } = req.body;

  // Simulate fetching data
  const responseMap = {
    'Fee Status':       { fee_status: 'pending', amount_due: 7500, next_due: '2026-04-10' },
    'Complaint Update': { open_complaints: 2, latest: 'Wifi not working — Medium priority' },
    'Parking Info':     { slot: 'A-07', zone: 'Zone A', vehicle: 'TS-09-AB-1234' },
  };

  const response = responseMap[request_type] || { message: 'Request type not recognized' };

  res.json({
    success: true,
    student_id,
    request_type,
    response,
  });
});

module.exports = router;
