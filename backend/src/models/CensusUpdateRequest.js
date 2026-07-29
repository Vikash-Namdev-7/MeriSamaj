const mongoose = require('mongoose');

const censusUpdateRequestSchema = new mongoose.Schema({
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true
  },
  memberName: {
    type: String,
    required: true,
    trim: true
  },
  relation: {
    type: String,
    default: 'Self',
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  fieldToUpdate: {
    type: String,
    enum: ['Name', 'Age', 'Marital Status', 'Education', 'Profession', 'Phone', 'Address', 'Other'],
    required: true
  },
  newValue: {
    type: String,
    required: true,
    trim: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    index: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNote: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

censusUpdateRequestSchema.index({ communityId: 1, status: 1, createdAt: -1 });

const CensusUpdateRequest = mongoose.model('CensusUpdateRequest', censusUpdateRequestSchema);

module.exports = CensusUpdateRequest;
