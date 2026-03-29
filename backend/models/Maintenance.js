const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: { type: String, required: true },
  roomNumber: { type: String, required: true },
  issue: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  status: {
    type: String,
    enum: ['open', 'assigned', 'in_progress', 'completed'],
    default: 'open',
  },
  assignedTo: { type: String, default: '' },
  estimatedCompletion: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
