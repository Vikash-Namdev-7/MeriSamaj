const mongoose = require('mongoose');

/**
 * AnnouncementChannel Model
 *
 * WhatsApp Communities-style broadcast channels for a community.
 *
 * Key behaviour:
 *  - All verified members of the community are automatically subscribed.
 *  - No manual join/leave. Access is managed by membership in the community.
 *  - Only members matching `whoCanPost` setting can post new announcements.
 *  - All messages use the shared Message + Conversation models.
 */
const announcementChannelSchema = new mongoose.Schema(
  {
    // ─── Community Isolation ──────────────────────────────────────────────────
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true
    },

    // ─── Display Info ─────────────────────────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    avatar:         { type: String, default: null },
    avatarPublicId: { type: String, default: null },

    // ─── Visibility Permission ───────────────────────────────────────────────
    whoCanView: {
      type: String,
      enum: ['everyone', 'verified_members', 'moderators', 'head_and_admins', 'head_only'],
      default: 'everyone'
    },

    // ─── Post Permission ─────────────────────────────────────────────────────
    /**
     * whoCanPost:
     *  'everyone'          — Any community member
     *  'verified_members'  — Verified members
     *  'moderators'        — Head, Admins, Moderators
     *  'head_and_admins'   — Head and Admins only
     *  'head_only'         — Only the Community Head
     */
    whoCanPost: {
      type: String,
      enum: ['everyone', 'verified_members', 'moderators', 'head_and_admins', 'head_only'],
      default: 'head_only'
    },

    // ─── Default Channel ─────────────────────────────────────────────────────
    isDefault: {
      type: Boolean,
      default: false
    },

    // ─── Creator ─────────────────────────────────────────────────────────────
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // ─── Linked Conversation ─────────────────────────────────────────────────
    // type: 'community', referenceId: channel._id
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null
    },

    // ─── Pinned Messages ─────────────────────────────────────────────────────
    pinnedMessages: [
      {
        messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
        pinnedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        pinnedAt:  { type: Date, default: Date.now }
      }
    ],

    // ─── State ───────────────────────────────────────────────────────────────
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
    isDeleted:  { type: Boolean, default: false },
    deletedAt:  { type: Date, default: null }
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
announcementChannelSchema.index({ communityId: 1, isDeleted: 1 });
announcementChannelSchema.index({ communityId: 1, isArchived: 1 });

module.exports = mongoose.model('AnnouncementChannel', announcementChannelSchema);
