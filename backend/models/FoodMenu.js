const mongoose = require('mongoose');

const foodMenuSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  breakfast: {
    type: String,
    required: true,
  },
  lunch: {
    type: String,
    required: true,
  },
  dinner: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 100,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('FoodMenu', foodMenuSchema);
