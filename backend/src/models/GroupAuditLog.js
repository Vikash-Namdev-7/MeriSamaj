const mongoose = require('mongoose');

const groupAuditLogSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true, index: true },
    action: { type: String, required: true }, // e.g., 'created', 'approved', 'archived', 'member_added', 'chat_cleared'
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} } // Flexible object for storing changes
  },
  { timestamps: true }
);

module.exports = mongoose.model('GroupAuditLog', groupAuditLogSchema);
