const mongoose = require('mongoose');

const userBlockSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    blockedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reason: { type: String }
  },
  { timestamps: true }
);

// ─── Prevent duplicate blocks ─────────────────────────────────────────────────
userBlockSchema.index({ userId: 1, blockedUserId: 1 }, { unique: true });

module.exports = mongoose.model('UserBlock', userBlockSchema);
