const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['One-time', 'Monthly', 'Yearly'], default: 'One-time' },
  txnId: { type: String, required: true, unique: true },
  paymentMode: { type: String, default: 'Online' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
  date: { type: Date, default: Date.now },
}, {
  timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);
