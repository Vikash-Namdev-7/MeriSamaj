const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  description: { type: String, trim: true },
  targetAmount: { type: Number, min: 0 },
  raisedAmount: { type: Number, default: 0, min: 0 },
  donorCount: { type: Number, default: 0, min: 0 },
  category: { type: String, default: 'General', trim: true },
  coverImage: { type: String, trim: true },
  status: { type: String, default: 'Active' },
  isDeleted: { type: Boolean, default: false, index: true },
  txnId: { type: String, sparse: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  campaign: { type: mongoose.Schema.Types.ObjectId },
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  amount: { type: Number, default: 0 },
  paymentMode: { type: String, default: 'Online (UPI)' },
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
