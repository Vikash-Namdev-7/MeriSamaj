const mongoose = require('mongoose');

const dharmashalaBookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  dharmashala: { type: mongoose.Schema.Types.ObjectId, ref: 'Dharmashala', required: true },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DharmashalaRoom' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending_approval', 'approved', 'checked_in', 'checked_out', 'completed', 'cancelled', 'no_show'], 
    default: 'pending_approval' 
  },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  nights: { type: Number, required: true },
  roomType: { type: String, enum: ['AC', 'General'] },
  checkInTime: { type: String, default: '10:00' },
  checkOutTime: { type: String, default: '10:00' },
  totalAmount: { type: Number, required: true },
  bookedBy: { type: String, required: true },
  phone: { type: String, required: true },
  specialRequests: { type: String },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  remarks: { type: String },
  statusHistory: [{
    status: { type: String },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: String }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('DharmashalaBooking', dharmashalaBookingSchema);
