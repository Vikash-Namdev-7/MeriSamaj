const mongoose = require('mongoose');

const shortlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MatrimonialProfile',
      required: true
    },
    notes: { type: String, maxlength: 500 }
  },
  { timestamps: true }
);

// ─── Prevent duplicate shortlist entries ─────────────────────────────────────
shortlistSchema.index({ userId: 1, profileId: 1 }, { unique: true });

module.exports = mongoose.model('Shortlist', shortlistSchema);
