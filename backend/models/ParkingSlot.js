const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotId:      { type: String, required: true, unique: true }, // e.g. 'A-01', 'B-12'
  zone:        { type: String, enum: ['A', 'B', 'C', 'D'], default: 'A' },
  slotNumber:  { type: Number, required: true },
  type:        { type: String, enum: ['bike', 'car', 'both'], default: 'bike' },
  isOccupied:  { type: Boolean, default: false },
  // Vehicle currently parked
  vehicleNo:   { type: String, default: null },       // e.g. 'MH-12-AB-1234'
  vehicleType: { type: String, default: null },       // 'bike' or 'car'
  studentId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  studentName: { type: String, default: null },
  blockNo:     { type: String, default: null },       // nearest hostel block
  entryTime:   { type: Date, default: null },
  // Stats
  totalUsage:  { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
