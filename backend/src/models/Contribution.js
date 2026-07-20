const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  txnId: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, default: 'Online' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Approved' },
  date: { type: Date, default: Date.now }
});

const contributionSchema = new mongoose.Schema({
  fundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fund',
    required: true,
    index: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true
  },
  assignedAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  lastPaymentDate: { type: Date },
  transactions: [transactionSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Contribution', contributionSchema);
