const mongoose = require('mongoose');

const postLikeSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique likes to prevent duplicates
postLikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

const PostLike = mongoose.model('PostLike', postLikeSchema);

module.exports = PostLike;
