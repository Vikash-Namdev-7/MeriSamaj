const mongoose = require('mongoose');

/**
 * MarriageRequest.js
 * Tracks the marriage confirmation lifecycle between two Connected users.
 * Always references the accepted InterestRequest that created the connection.
 */
const marriageRequestSchema = new mongoose.Schema(
  {
    // ─── The user who initiates the marriage confirmation ────────────────────
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // ─── The other connected user who needs to confirm ───────────────────────
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // ─── Links back to the accepted InterestRequest (the connection) ─────────
    interestRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterestRequest',
      required: true
    },

    // ─── Status ──────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      index: true
    },

    // ─── Optional message from requester ─────────────────────────────────────
    message: { type: String, maxlength: 500 },

    // ─── Admin Override (optional) ────────────────────────────────────────────
    adminNote: { type: String },
    adminActionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ─── Timestamps ──────────────────────────────────────────────────────────
    requestedAt:  { type: Date, default: Date.now },
    respondedAt:  { type: Date }
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
marriageRequestSchema.index({ requesterId: 1, receiverId: 1 });
marriageRequestSchema.index({ interestRequestId: 1 });
marriageRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('MarriageRequest', marriageRequestSchema);
