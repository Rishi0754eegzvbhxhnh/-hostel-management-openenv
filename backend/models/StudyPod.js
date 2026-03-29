const mongoose = require('mongoose');

const studyPodSchema = new mongoose.Schema({
  podName: { type: String, required: true },
  block: { type: String, required: true },
  capacity: { type: Number, default: 4 },
  amenities: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
}, {
  timestamps: true,
});

const studyPodBookingSchema = new mongoose.Schema({
  pod: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPod', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  purpose: { type: String },
}, {
  timestamps: true,
});

const StudyPod = mongoose.model('StudyPod', studyPodSchema);
const StudyPodBooking = mongoose.model('StudyPodBooking', studyPodBookingSchema);

module.exports = { StudyPod, StudyPodBooking };
