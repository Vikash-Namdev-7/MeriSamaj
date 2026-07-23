const mongoose = require('mongoose');

const groupInvitationSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending', index: true },
    resolvedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// Prevent duplicate pending invitations for the same user to the same group
groupInvitationSchema.index({ group: 1, user: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

module.exports = mongoose.model('GroupInvitation', groupInvitationSchema);
