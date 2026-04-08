const mongoose = require('mongoose');

const foodMenuSchema = new mongoose.Schema({
  // 'week' for the full weekly menu, or 'Monday'–'Sunday' for legacy rows
  day: { type: String, required: true },

  // ── New format: full week JSON stored in one doc ─────────────────────────
  // Shape: { Monday: { breakfast: { items, time, image }, lunch: ..., dinner: ... }, ... }
  menuData: { type: mongoose.Schema.Types.Mixed, default: null },

  // ── Legacy fields (kept for backward compatibility with old /api/food routes) ──
  breakfast: { type: String, default: '' },
  lunch:     { type: String, default: '' },
  dinner:    { type: String, default: '' },
  price:     { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('FoodMenu', foodMenuSchema);
