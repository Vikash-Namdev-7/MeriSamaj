const mongoose = require('mongoose');

const announcementAuditLogSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AnnouncementChannel',
      required: true,
      index: true
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true
    },
    action: {
      type: String,
      enum: [
        'CHANNEL_CREATED',
        'CHANNEL_EDITED',
        'PERMISSION_CHANGED',
        'ANNOUNCEMENT_SENT',
        'PINNED',
        'UNPINNED',
        'ARCHIVED',
        'RESTORED',
        'SOFT_DELETED',
        'HARD_DELETED'
      ],
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnnouncementAuditLog', announcementAuditLogSchema);
