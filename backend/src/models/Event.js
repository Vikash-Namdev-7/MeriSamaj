const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleEn: { type: String },
  date: { type: String, required: true }, // Formatted date string, e.g., 'Jul 15, 2026'
  day: { type: String, required: true },
  month: { type: String, required: true },
  monthShort: { type: String, required: true },
  weekday: { type: String },
  time: { type: String, required: true },
  timeEn: { type: String },
  venue: { type: String, required: true },
  venueEn: { type: String },
  description: { type: String, required: true },
  descriptionEn: { type: String },
  category: { 
    type: String, 
    required: true,
    enum: ['Cultural', 'Education', 'Matrimonial', 'Health', 'Sports'],
    default: 'Cultural' 
  },
  categoryEn: { type: String },
  image: { type: String }, // Banner Image URL
  isFeatured: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  entryFee: { type: String, default: 'Free' },
  contact: { type: String },
  
  // Scoping fields
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: false,
    index: true
  },
  isGlobal: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Organizer details
  organizer: {
    name: { type: String },
    role: { type: String },
    avatar: { type: String },
    initials: { type: String }
  },

  // Structured Info
  objectiveEn: { type: String },
  programsEn: [{ type: String }],
  audienceEn: { type: String },
  importantInfoEn: { type: String },
  tagsEn: [{ type: String }],
  
  // Interaction Trackers
  interested: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reminders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
