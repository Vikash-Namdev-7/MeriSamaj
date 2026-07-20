const mongoose = require('mongoose');

const fundExpenseSchema = new mongoose.Schema({
  fundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fund',
    required: true,
    index: true
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true
  },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  amount: { type: Number, required: true },
  category: { type: String, default: 'General', trim: true },
  date: { type: Date, default: Date.now },
  addedBy: { type: String, default: 'Admin', trim: true },
  receiptAttached: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('FundExpense', fundExpenseSchema);
