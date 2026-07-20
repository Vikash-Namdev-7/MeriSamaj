const mongoose = require('mongoose');

/**
 * Community Model — Core of Multi-Tenant Architecture
 *
 * Every piece of community data (Posts, Invitations, Donations, Events, etc.)
 * references this model via `communityId`. This enables strict data isolation
 * across communities on a shared database.
 */
const communitySchema = new mongoose.Schema(
  {
    // Display Info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
    },
    city: {
      type: String,
      trim: true,
    },
    
    // Modern multi-city mapping
    cityIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City'
      }
    ],

    // Assigned Community Head (single head per community)
    headId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    /**
     * Per-Community Module Settings
     * Master Admin can enable/disable specific features for each community.
     * Frontend + backend both check these flags before exposing a module.
     */
    settings: {
      matrimonialEnabled: { type: Boolean, default: true },
      donationEnabled:    { type: Boolean, default: true },
      invitationEnabled:  { type: Boolean, default: true },
      eventEnabled:       { type: Boolean, default: true },
      directoryEnabled:   { type: Boolean, default: true },
      dharmashalaEnabled: { type: Boolean, default: true },
      obituaryEnabled:    { type: Boolean, default: true },
      socialFeedEnabled:  { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name before saving (if slug not provided)
communitySchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')          // spaces → hyphens
      .replace(/[^\w-]+/g, '')       // remove non-word chars
      .replace(/--+/g, '-')          // collapse multiple hyphens
      .trim();
  }
  next();
});

const Community = mongoose.model('Community', communitySchema);

module.exports = Community;
