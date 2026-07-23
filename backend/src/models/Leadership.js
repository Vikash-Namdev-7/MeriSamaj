const mongoose = require('mongoose');

const leadershipSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  initials: {
    type: String
  },
  role: {
    type: String,
    required: true,
    enum: [
      'President', 
      'Patron', 
      'Vice President', 
      'Secretary', 
      'Joint Secretary', 
      'Treasurer', 
      'Minister (Education)', 
      'Minister (Youth)', 
      'Minister (Women Welfare)', 
      'Minister (Social)', 
      'Zonal Head', 
      'Area Sub-Head'
    ],
    default: 'Secretary'
  },
  level: {
    type: String,
    enum: ['National', 'State', 'District', 'City'],
    default: 'City'
  },
  city: {
    type: String,
    default: 'Indore'
  },
  state: {
    type: String,
    default: 'Madhya Pradesh'
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  avatar: {
    type: String
  },
  bio: {
    type: String
  },
  termYears: {
    type: String,
    default: '2024-2027'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Leadership = mongoose.model('Leadership', leadershipSchema);

module.exports = Leadership;
