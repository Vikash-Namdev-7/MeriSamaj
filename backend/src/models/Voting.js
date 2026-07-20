const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  initials: { type: String, required: true },
  age: { type: Number },
  profession: { type: String },
  avatar: { type: String }, // URL
  shortIntro: { type: String },
  bio: { type: String },
  manifesto: [{ type: String }],
  experience: { type: String },
  education: { type: String }
});

const votingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    default: 'Community Election'
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Active', 'Completed', 'Closed'],
    default: 'Active'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  candidates: [candidateSchema],
  
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

const Voting = mongoose.model('Voting', votingSchema);

module.exports = Voting;
