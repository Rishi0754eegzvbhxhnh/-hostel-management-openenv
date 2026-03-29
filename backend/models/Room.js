const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['single', 'shared', 'suite'],
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  pricePerMonth: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  features: [String],
  view360: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Room', roomSchema);
