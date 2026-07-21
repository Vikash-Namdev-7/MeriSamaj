const mongoose = require('mongoose');

const storyViewSchema = new mongoose.Schema(
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

// Prevent duplicate unique story view logs
storyViewSchema.index({ storyId: 1, userId: 1 }, { unique: true });

const StoryView = mongoose.model('StoryView', storyViewSchema);

module.exports = StoryView;
