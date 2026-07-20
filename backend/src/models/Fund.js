const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  purpose: { type: String, trim: true },
  description: { type: String, trim: true },
  targetAmount: { type: Number, required: true },
  contributionPerMember: { type: Number, required: true },
  dueDate: { type: Date },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['Draft', 'Active', 'Completed', 'Closed', 'Expired', 'Cancelled'], default: 'Active' },
  scope: { type: String, enum: ['GLOBAL', 'COMMUNITY'], default: 'COMMUNITY', required: true },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    index: true,
    default: null
  },
  assignedMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Fund', fundSchema);
