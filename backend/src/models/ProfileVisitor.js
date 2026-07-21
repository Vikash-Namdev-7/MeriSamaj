const mongoose = require('mongoose');

const profileVisitorSchema = new mongoose.Schema(
  {
    visitorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MatrimonialProfile',
      required: true,
      index: true
    },
    visitCount:  { type: Number, default: 1 },
    lastVisited: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

// ─── Upsert index: one document per visitor/profile pair (no duplicates) ──────
profileVisitorSchema.index({ visitorId: 1, profileId: 1 }, { unique: true });

module.exports = mongoose.model('ProfileVisitor', profileVisitorSchema);
