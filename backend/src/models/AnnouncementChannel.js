const mongoose = require('mongoose');

const AnnouncementChannelSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  whoCanPost: {
    type: String,
    enum: ['head_only', 'all_members', 'head_and_subhead', 'admin_only', 'moderators'],
    default: 'head_only'
  },
  whoCanView: {
    type: String,
    enum: ['everyone', 'members_only', 'verified_members', 'moderators', 'head_and_admins', 'head_only'],
    default: 'everyone'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals for easy populate access
AnnouncementChannelSchema.virtual('conversation', {
  ref: 'Conversation',
  localField: 'conversationId',
  foreignField: '_id',
  justOne: true
});

AnnouncementChannelSchema.virtual('community', {
  ref: 'Community',
  localField: 'communityId',
  foreignField: '_id',
  justOne: true
});

// Compound Indexes for high-performance lookup by ID, Community & Conversation
AnnouncementChannelSchema.index({ communityId: 1, isDeleted: 1 });
AnnouncementChannelSchema.index({ conversationId: 1, isDeleted: 1 });
AnnouncementChannelSchema.index({ _id: 1, isDeleted: 1 });

module.exports = mongoose.model('AnnouncementChannel', AnnouncementChannelSchema);
