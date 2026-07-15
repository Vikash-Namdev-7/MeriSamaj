const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  title: { type: String, required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  category: { type: String, default: 'General' },
  date: { type: Date, default: Date.now },
  documents: [{
    fileName: String,
    fileUrl: String,
    fileType: String
  }],
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
