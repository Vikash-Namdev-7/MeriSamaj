const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  voting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voting',
    required: true,
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
  }
}, { timestamps: true });

// Prevent a user from voting more than once on the same Voting
voteSchema.index({ user: 1, voting: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
