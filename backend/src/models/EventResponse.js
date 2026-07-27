const mongoose = require('mongoose');

const eventResponseSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  isInterested: {
    type: Boolean,
    default: false,
    index: true
  },
  isGoing: {
    type: Boolean,
    default: false,
    index: true
  },
  response: {
    type: String,
    enum: ['Interested', 'Going', 'Not Going', 'None'],
    default: 'None',
    index: true
  },
  bookmarked: {
    type: Boolean,
    default: false
  },
  reminderEnabled: {
    type: Boolean,
    default: false
  },
  registered: {
    type: Boolean,
    default: false
  },
  registeredAt: {
    type: Date
  },
  respondedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one reaction response record per member per event
eventResponseSchema.index({ eventId: 1, memberId: 1 }, { unique: true });
// Compound index for fast aggregation of attendance and interest stats
eventResponseSchema.index({ eventId: 1, isInterested: 1, isGoing: 1, registered: 1, response: 1 });

module.exports = mongoose.model('EventResponse', eventResponseSchema);
