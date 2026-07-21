const mongoose = require('mongoose');

const socialAuditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    adminName: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true,
      index: true
    }, // e.g. 'delete_post', 'hide_story', 'restore_comment'
    targetType: {
      type: String,
      required: true,
      enum: ['Post', 'Story', 'Comment', 'Like', 'Save', 'Follower', 'Category', 'Settings'],
      index: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true
    },
    details: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SocialAuditLog', socialAuditLogSchema);
