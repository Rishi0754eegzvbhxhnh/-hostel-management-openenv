const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  collegeId: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'staff'],
    default: 'student',
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  },
  // OAuth fields
  googleId: { type: String, default: null },
  githubId: { type: String, default: null },
  avatar: { type: String, default: null },
  // Personalized features
  habits: {
    sleepTime: { type: String, default: '11:00 PM' },
    wakeTime: { type: String, default: '7:00 AM' },
    smoking: { type: Boolean, default: false },
    drinking: { type: Boolean, default: false },
    foodPreference: { type: String, enum: ['Veg', 'Non-Veg', 'Both'], default: 'Both' },
  },
  interests: [{ type: String }],
  studySchedule: {
    preferredTime: { type: String, enum: ['Morning', 'Late Night', 'Afternoon'], default: 'Morning' },
    noiseTolerance: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  },
  moodLogs: [{
    mood: { type: String, enum: ['happy', 'stressed', 'tired', 'anxious', 'energetic'], default: 'happy' },
    timestamp: { type: Date, default: Date.now },
  }],
  // Gamification & Community
  points: { type: Number, default: 0 },
  ecoPoints: { type: Number, default: 0 },
  badges: [{
    name: { type: String },
    icon: { type: String },
    date: { type: Date, default: Date.now },
  }],
  skills: [{ type: String }], // for Skill-Sharing Hub
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (this.password && this.password.startsWith('$2')) return; // already hashed
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
