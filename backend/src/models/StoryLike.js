const mongoose = require('mongoose');

const storyLikeSchema = new mongoose.Schema(
  {
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
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

// Enforce unique likes on stories
storyLikeSchema.index({ storyId: 1, userId: 1 }, { unique: true });

const StoryLike = mongoose.model('StoryLike', storyLikeSchema);

module.exports = StoryLike;
