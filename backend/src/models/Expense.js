const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  /**
   * communityId — Community isolation key.
   * Inherited from parent Campaign's communityId.
   */
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    index: true,
    default: null,
  },
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
