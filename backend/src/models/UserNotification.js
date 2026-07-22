const mongoose = require('mongoose');

/**
 * UserNotification — Centralized notification system for ALL modules.
 * Events, Donations, Voting, Matrimonial, Chat, Referrals, etc. all use this.
 */
const userNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // ─── Categorization ──────────────────────────────────────────────────────
    module: {
      type: String,
      enum: ['matrimonial', 'events', 'donations', 'voting', 'chat', 'referral', 'fund', 'system', 'community'],
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      index: true
      // Examples: matrimonial_interest_received, matrimonial_interest_accepted,
      //           matrimonial_subscription_expired, chat_new_message, event_reminder, etc.
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },

    // ─── Content ─────────────────────────────────────────────────────────────
    icon:     { type: String, default: '🔔' },
    title:    { type: String, required: true },
    message:  { type: String, required: true },
    actionUrl:{ type: String },          // Deep link or URL for navigation

    // ─── Reference (for navigation / detail lookup) ───────────────────────────
    referenceId:  { type: mongoose.Schema.Types.ObjectId },
    referenceType:{ type: String },      // 'InterestRequest', 'Event', 'Donation'…

    // ─── State ───────────────────────────────────────────────────────────────
    isRead:   { type: Boolean, default: false, index: true },
    readAt:   { type: Date }
  },
  { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
userNotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
userNotificationSchema.index({ userId: 1, module: 1 });

module.exports = mongoose.model('UserNotification', userNotificationSchema);
