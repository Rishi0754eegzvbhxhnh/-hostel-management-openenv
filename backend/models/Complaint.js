const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  roomNumber: { type: String, required: true },
  category: {
    type: String,
    enum: ['maintenance', 'food', 'cleanliness', 'security', 'noise', 'other'],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }], // URLs (base64 or cloud)
  status: {
    type: String,
    enum: ['pending', 'in_review', 'resolved', 'rejected'],
    default: 'pending',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  aiStatus: {
    type: String,
    enum: ['authentic', 'ai_detected', 'uncertain'],
    default: 'uncertain',
  },
  aiConfidence: { type: Number, default: 0 },
  adminResponse: { type: String, default: '' },
  resolvedAt: { type: Date },
  // ── Hugging Face AI Classification ──────────────────────────────────────
  hfPriority: { type: String, default: null }, // AI-suggested priority
  hfCategory:  { type: String, default: null }, // AI-detected category
  hfModel:     { type: String, default: null }, // Model used (or 'rule-based')
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
