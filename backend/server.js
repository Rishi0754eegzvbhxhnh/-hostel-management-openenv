const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');

// Load environment variables FIRST before requiring passport
dotenv.config();

const passport = require('./config/passport');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(session({
  secret: process.env.JWT_SECRET || 'secretkey123',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');
const complaintRoutes = require('./routes/complaints');
const adminRoutes = require('./routes/admin');
const vacationRoutes = require('./routes/vacation');
const paymentRoutes = require('./routes/payments');
const roomRoutes = require('./routes/rooms');
const aiRoutes = require('./routes/ai');
const newsRoutes = require('./routes/news');
const iotRoutes = require('./routes/iot');
const financeRoutes = require('./routes/finance');
const imageAnalysisRoutes = require('./routes/imageAnalysis');
const hostelDiscoveryRoutes = require('./routes/hostelDiscovery');

const notificationRoutes = require('./routes/notifications');
const forecastRoutes     = require('./routes/forecast');
const sampleRoutes       = require('./routes/sample');
const parkingRoutes      = require('./routes/parking');
const tourismRoutes      = require('./routes/tourism');
const parentsRoutes      = require('./routes/parents');
const securityRoutes     = require('./routes/security');
const studyPodsRoutes    = require('./routes/studypods');
const eventsRoutes       = require('./routes/events');


app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vacation', vacationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/image-analysis', imageAnalysisRoutes);
app.use('/api/discovery', hostelDiscoveryRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/api/forecast',      forecastRoutes);
app.use('/api/sample',        sampleRoutes);
app.use('/api/parking',       parkingRoutes);
app.use('/api/tourism',       tourismRoutes);
app.use('/api/parents',       parentsRoutes);
app.use('/api/security',      securityRoutes);
app.use('/api/studypods',     studyPodsRoutes);
app.use('/api/events',        eventsRoutes);



// Health check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'server is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Database Connection & Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.listen(PORT, () => {
  console.log(`📡 Backend Server alive @ http://localhost:${PORT}`);
  
  mongoose.connect(MONGO_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB');
      // SEED SUPERADMIN
      try {
        const User = require('./models/User');
        const exists = await User.findOne({ email: 'superadmin@hostel.com' });
        if (!exists) {
          const admin = new User({
            fullName: 'Super Admin',
            email: 'superadmin@hostel.com',
            password: 'password123',
            role: 'admin',
            collegeId: 'HOSTEL-SUPER-001',
            phone: '9999999999'
          });
          await admin.save();
          console.log('🔐 Debug Admin created: superadmin@hostel.com / password123');
        }
      } catch (e) { console.error('Seeder failed:', e.message); }
    })
    .catch(err => {
      console.error('❌ MONGODB ERROR:', err.message);
    });
});
