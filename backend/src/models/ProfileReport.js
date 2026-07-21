const mongoose = require('mongoose');

const profileReportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    reason: {
      type: String,
      enum: ['fake_profile', 'inappropriate_photos', 'harassment', 'spam', 'fraud', 'other'],
      required: true
    },
    description: { type: String, maxlength: 1000 },

    // ─── Moderation ──────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'actioned', 'dismissed'],
      default: 'pending',
      index: true
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    adminNotes: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProfileReport', profileReportSchema);
