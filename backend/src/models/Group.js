const mongoose = require('mongoose');

/**
 * Group Model — Community Chat Groups
 *
 * Supports extended role hierarchy: head > admin > moderator > member
 * and granular permission flags so future UI changes require no schema migration.
 *
 * communityId isolation: only members of the same community may join.
 */

// ─── Member Sub-Document ──────────────────────────────────────────────────────
const groupMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    /**
     * Role hierarchy:
     *  head       — The community head (auto-assigned, cannot be changed)
     *  admin      — Group administrator (can add/remove members, pin messages)
     *  moderator  — Can delete others' messages (future UI)
     *  member     — Regular group participant
     */
    role: {
      type: String,
      enum: ['head', 'admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt:   { type: Date, default: Date.now },
    addedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    // Per-member mute (muted until this date)
    mutedUntil: { type: Date, default: null }
  },
  { _id: false }
);

// ─── Chat Permission Settings ─────────────────────────────────────────────────
const chatPermissionsSchema = new mongoose.Schema(
  {
    /**
     * Each field accepts: 'all' | 'moderator' | 'admin' | 'head'
     * Meaning: who and above can perform this action.
     */
    canSendMessages:         { type: String, enum: ['all', 'moderator', 'admin', 'head'], default: 'all' },
    canSendMedia:            { type: String, enum: ['all', 'moderator', 'admin', 'head'], default: 'all' },
    canSendLinks:            { type: String, enum: ['all', 'moderator', 'admin', 'head'], default: 'all' },
    canPinMessages:          { type: String, enum: ['moderator', 'admin', 'head'],        default: 'admin' },
    canDeleteOthersMessages: { type: String, enum: ['moderator', 'admin', 'head'],        default: 'admin' },
    canAddMembers:           { type: String, enum: ['all', 'moderator', 'admin', 'head'], default: 'admin' },
    canRemoveMembers:        { type: String, enum: ['moderator', 'admin', 'head'],        default: 'admin' },
    canEditGroupInfo:        { type: String, enum: ['admin', 'head'],                    default: 'admin' },
    canChangeSettings:       { type: String, enum: ['admin', 'head'],                    default: 'admin' }
  },
  { _id: false }
);

// ─── Group Schema ─────────────────────────────────────────────────────────────
const groupSchema = new mongoose.Schema(
  {
    // ─── Community Isolation ────────────────────────────────────────────────
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true
    },

    // ─── Display Info ────────────────────────────────────────────────────────
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
    avatar:          { type: String, default: null },   // Cloudinary URL
    avatarPublicId:  { type: String, default: null },   // For Cloudinary deletion

    // ─── Category & Type ────────────────────────────────────────────────────
    category: {
      type: String,
      enum: ['General', 'Youth', 'Women', 'Business', 'Education', 'Religious', 'Other'],
      default: 'General'
    },
    /**
     * type:
     *  public       — Any community member can join
     *  private      — Must be invited (admin adds)
     *  invite_only  — Only admin/head can add members, no self-join
     */
    type: {
      type: String,
      enum: ['public', 'private', 'invite_only'],
      default: 'public'
    },

    // ─── Creation & Approval ────────────────────────────────────────────────
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    /**
     * approvalStatus — used when community groupCreationPolicy requires approval
     *  approved   — visible and active
     *  pending    — awaiting Head approval
     *  rejected   — rejected by Head
     */
    approvalStatus: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved'
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },

    // ─── Members ─────────────────────────────────────────────────────────────
    members: [groupMemberSchema],

    // ─── Chat Permissions ────────────────────────────────────────────────────
    chatPermissions: {
      type: chatPermissionsSchema,
      default: () => ({})
    },

    // ─── Linked Conversation ─────────────────────────────────────────────────
    // One Conversation document per group (type: 'group', referenceId: group._id)
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null
    },

    // ─── Pinned Messages ────────────────────────────────────────────────────
    pinnedMessages: [
      {
        messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
        pinnedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        pinnedAt:  { type: Date, default: Date.now }
      }
    ],

    // ─── State ──────────────────────────────────────────────────────────────
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
    isDeleted:  { type: Boolean, default: false },
    deletedAt:  { type: Date, default: null }
  },
  { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────────────────────────
groupSchema.index({ communityId: 1, isDeleted: 1 });
groupSchema.index({ communityId: 1, category: 1 });
groupSchema.index({ communityId: 1, approvalStatus: 1 });
groupSchema.index({ 'members.userId': 1 });
groupSchema.index({ name: 'text', description: 'text' }); // Full-text search

// ─── Virtual: memberCount ────────────────────────────────────────────────────
groupSchema.virtual('memberCount').get(function () {
  return this.members ? this.members.length : 0;
});

// ─── Helper: check if user is a member ──────────────────────────────────────
groupSchema.methods.isMember = function (userId) {
  return this.members.some(m => m.userId.toString() === userId.toString());
};

// ─── Helper: get member role ─────────────────────────────────────────────────
groupSchema.methods.getMemberRole = function (userId) {
  const member = this.members.find(m => m.userId.toString() === userId.toString());
  return member ? member.role : null;
};

// ─── Helper: check if user has minimum role level ────────────────────────────
const ROLE_LEVEL = { head: 4, admin: 3, moderator: 2, member: 1 };

groupSchema.methods.hasMinRole = function (userId, minRole) {
  const role = this.getMemberRole(userId);
  if (!role) return false;
  return (ROLE_LEVEL[role] || 0) >= (ROLE_LEVEL[minRole] || 0);
};

// ─── Helper: check permission ─────────────────────────────────────────────────
groupSchema.methods.canPerform = function (userId, permissionKey) {
  const role = this.getMemberRole(userId);
  if (!role) return false;
  const requiredMinRole = this.chatPermissions[permissionKey] || 'admin';
  return (ROLE_LEVEL[role] || 0) >= (ROLE_LEVEL[requiredMinRole] || 0);
};

module.exports = mongoose.model('Group', groupSchema);
