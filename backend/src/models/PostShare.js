const mongoose = require('mongoose');

const postShareSchema = new mongoose.Schema(
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
    platform: {
      type: String,
      enum: ['internal', 'facebook', 'whatsapp', 'copy_link'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PostShare = mongoose.model('PostShare', postShareSchema);

module.exports = PostShare;
