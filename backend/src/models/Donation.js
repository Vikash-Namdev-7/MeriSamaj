const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  targetAmount: { type: Number, required: true, min: 0 },
  raisedAmount: { type: Number, default: 0, min: 0 },
  donorCount: { type: Number, default: 0, min: 0 },
  category: { type: String, default: 'General', trim: true },
  coverImage: { type: String, trim: true },
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
  isDeleted: { type: Boolean, default: false, index: true },
  recentDonations: [
    {
      donorName: { type: String, default: 'Anonymous' },
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
      paymentStatus: { type: String, default: 'success' }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);
