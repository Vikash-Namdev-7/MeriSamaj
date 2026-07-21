const mongoose = require('mongoose');

const postViewSchema = new mongoose.Schema(
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
    duration: {
      type: Number, // duration viewed in seconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate unique post view entries
postViewSchema.index({ postId: 1, userId: 1 }, { unique: true });

const PostView = mongoose.model('PostView', postViewSchema);

module.exports = PostView;
