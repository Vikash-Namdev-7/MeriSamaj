const mongoose = require('mongoose');

const groupJoinRequestSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    message: { type: String, default: '' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// Prevent duplicate pending requests
groupJoinRequestSchema.index({ group: 1, user: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

module.exports = mongoose.model('GroupJoinRequest', groupJoinRequestSchema);
