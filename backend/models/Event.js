const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // HH:MM format
  endTime: { type: String, required: true }, // HH:MM format
  location: { type: String, required: true },
  category: { type: String, enum: ['cultural', 'sports', 'academic', 'social', 'workshop'], default: 'social' },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  capacity: { type: Number, default: 100 },
  image: { type: String },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
