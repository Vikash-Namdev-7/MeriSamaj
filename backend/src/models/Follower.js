const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique index for follow relationships
followerSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follower = mongoose.model('Follower', followerSchema);

module.exports = Follower;
