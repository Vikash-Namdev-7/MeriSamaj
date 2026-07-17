const mongoose = require('mongoose');

const dharmashalaMaintenanceSchema = new mongoose.Schema({
  dharmashala: { type: mongoose.Schema.Types.ObjectId, ref: 'Dharmashala', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'DharmashalaRoom' }, // Optional, empty if entire property is blocked
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { 
    type: String, 
    enum: ['Cleaning', 'Repair', 'Renovation', 'Other'], 
    default: 'Cleaning' 
  },
  remarks: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('DharmashalaMaintenance', dharmashalaMaintenanceSchema);
