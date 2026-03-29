const mongoose = require('mongoose');

const energyUsageSchema = new mongoose.Schema({
  block: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true,
  },
  currentUsage: {
    type: Number, // In kWh
    required: true,
  },
  peakUsage: {
    type: Number,
    required: true,
  },
  averageUsage: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['normal', 'high', 'peak'],
    default: 'normal',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('EnergyUsage', energyUsageSchema);
