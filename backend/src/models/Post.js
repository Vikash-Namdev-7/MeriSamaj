const mongoose = require('mongoose');

/**
 * Post Model — Community Social Feed
 *
 * All posts are community-scoped. communityId is the primary isolation key.
 * Members can only see posts belonging to their own community.
 */

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const postSchema = new mongoose.Schema(
  {
    // Author
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    /**
     * Community Isolation Key
     * MANDATORY on all community data documents.
     * Server always sets this from req.user.communityId — client cannot override.
     */
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true,
    },

    // Content
    content: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],

    // Engagement
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],

    // Moderation
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Approved',
    },

    // Optional: allow pinning announcements
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
