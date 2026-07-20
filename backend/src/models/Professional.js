const mongoose = require('mongoose');

const ProfessionalSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  categoryKey: {
    type: String,
    required: true
  },
  profession: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  yearsOfExperience: {
    type: Number,
    required: true
  },
  workAddress: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  about: {
    type: String,
    required: true
  },
  media: [
    {
      type: {
        type: String,
        enum: ['image', 'video'],
        required: true
      },
      url: {
        type: String,
        required: true
      },
      publicId: String
    }
  ],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Suspended'],
    default: 'Pending',
    index: true
  },
  approval: {
    approvedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['ADMIN', 'HEAD'] }
    },
    approvedAt: Date,
    rejectedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['ADMIN', 'HEAD'] }
    },
    rejectedAt: Date,
    rejectionReason: String
  },
  credentialVerificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING'
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  verificationNote: String,
  rating: {
    type: Number,
    default: 5.0
  },
  initials: {
    type: String
  },
  phone: {
    type: String
  },
  businessTiming: {
    type: String,
    default: '09:00 AM - 08:00 PM'
  }
}, { timestamps: true });

module.exports = mongoose.model('Professional', ProfessionalSchema);
