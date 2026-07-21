const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, unique: true, trim: true },
    description:   { type: String },
    price:         { type: Number, required: true },           // In INR (0 for Free)
    durationInDays:{ type: Number, required: true },           // 0 for perpetual Free plan
    displayOrder:  { type: Number, default: 0 },               // For UI ordering
    isActive:      { type: Boolean, default: true },
    isFeatured:    { type: Boolean, default: false },          // Highlighted in UI

    // ─── Numerical Feature Limits (-1 = unlimited) ─────────────────────────
    features: {
      profileViewsPerDay:     { type: Number, default: 10 },   // -1 = unlimited
      interestLimit:          { type: Number, default: 5 },    // Per month; -1 = unlimited
      messageLimit:           { type: Number, default: -1 },   // -1 = unlimited
      advancedFilters:        { type: Boolean, default: false },
      visitorHistory:         { type: Boolean, default: false },
      chat:                   { type: Boolean, default: false },
      profileBoosts:          { type: Number, default: 0 },    // Per month
      highlightProfile:       { type: Boolean, default: false },
      priorityListing:        { type: Boolean, default: false },
      contactDetailsAccess:   { type: Boolean, default: false }, // After acceptance
      unlimitedShortlist:     { type: Boolean, default: false },
      readReceipts:           { type: Boolean, default: false },
      profileBadge:           { type: Boolean, default: false }  // Premium badge in search
    },

    // ─── Audit ───────────────────────────────────────────────────────────────
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
