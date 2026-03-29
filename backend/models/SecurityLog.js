const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['entry', 'exit', 'unauthorized'], required: true },
  method: { type: String, enum: ['face_recognition', 'qr_code', 'rfid'], default: 'qr_code' },
  location: { type: String, default: 'Main Gate' },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['authorized', 'flagged', 'blocked'], default: 'authorized' },
  metadata: {
     confidenceScore: { type: Number }, // For Face Recognition
     imageUrl: { type: String }, // Logged image
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('SecurityLog', securityLogSchema);
