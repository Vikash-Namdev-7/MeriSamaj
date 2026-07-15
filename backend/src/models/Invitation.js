const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['attending', 'attending_family', 'not_attending', 'pending'],
    default: 'pending'
  }
}, { _id: false });

const invitationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  hostName: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String, // String to store simple dates like YYYY-MM-DD
    required: true
  },
  timeFood: {
    type: String,
    trim: true
  },
  timeProgram: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  mapLink: {
    type: String,
    trim: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    trim: true
  },
  images: [{
    type: String, // URLs from Cloudinary
  }],
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Approved' // Setting to Approved by default for immediate display
  },
  rsvps: [rsvpSchema],
  invitedMemberIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  invitedGroupIds: [{
    type: String, // Keep as string for now if Group model doesn't exist
  }],
  // Backward compatibility fields
  groomName: {
    type: String,
    trim: true
  },
  brideName: {
    type: String,
    trim: true
  },
  familyName: {
    type: String,
    trim: true
  },
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation;
