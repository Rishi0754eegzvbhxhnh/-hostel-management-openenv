const mongoose = require('mongoose');

const laundryStatusSchema = new mongoose.Schema({
  machineNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['idle', 'running', 'out_of_order'],
    default: 'idle',
  },
  timeRemaining: {
    type: Number, // In minutes
    default: 0,
  },
  lastWashDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('LaundryStatus', laundryStatusSchema);
