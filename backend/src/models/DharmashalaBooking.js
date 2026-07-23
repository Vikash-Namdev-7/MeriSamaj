const mongoose = require('mongoose');

const dharmashalaBookingSchema = new mongoose.Schema({
  /**
   * communityId — Community isolation key.
   * Inherited from parent Dharmashala document's communityId on booking creation.
   */
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    index: true,
    default: null,
  },
  bookingId: { type: String, required: true, unique: true },
  dharmashala: { type: mongoose.Schema.Types.ObjectId, ref: 'Dharmashala', required: true },
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DharmashalaRoom' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: [
      'pending_approval', 
      'approved', 
      'reserved', 
      'payment_pending', 
      'paid', 
      'confirmed', 
      'upcoming', 
      'checked_in', 
      'checked_out', 
      'completed', 
      'cancelled', 
      'rejected', 
      'expired', 
      'no_show'
    ], 
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
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  
  // 15-Minute Temporary Reservation Lock
  reservedUntil: { type: Date },

  // Razorpay Transaction Details
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  paidAt: { type: Date },

  // Approval & Rejection Audit
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },

  // Cancellation & Refund
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  refundAmount: { type: Number, default: 0 },
  refundTxnId: { type: String },
  refundedAt: { type: Date },

  // Verification QR Code Data
  qrCodeData: { type: String },

  // Enterprise specific fields
  enterpriseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enterprise' },
  isEnterpriseBooking: { type: Boolean, default: false },

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
