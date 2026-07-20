const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: { type: String },
  description: { type: String },
  category: { type: String, default: 'General' },
  purpose: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  
  targetAmount: { type: Number, required: true },
  collectedAmount: { type: Number, default: 0 },
  expenseAmount: { type: Number, default: 0 },
  minDonation: { type: Number, default: 1 },
  maxDonation: { type: Number },
  currency: { type: String, default: 'INR' },
  
  city: { type: String },
  /**
   * communityId — PRIMARY community isolation key (ObjectId).
   * Admin sets this when creating a campaign.
   * @deprecated `community` String field below — will be removed after migration.
   */
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    index: true,
    default: null,
  },
  // @deprecated — use communityId (ObjectId) instead.
  community: { type: String },
  locations: [{ type: String }],
  
  status: { type: String, enum: ['Draft', 'Scheduled', 'Active', 'Published', 'Completed', 'Suspended', 'Archived'], default: 'Draft' },
  
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  
  bannerImage: { type: String },
  galleryImages: [{ type: String }],
  documents: [{
    fileName: String,
    fileUrl: String,
    fileType: String
  }],
  
  visibility: { 
    type: String, 
    enum: ['Entire Community', 'Selected Communities', 'All Locations', 'Selected Locations', 'Selected Cities', 'Selected States', 'Selected Members', 'Selected Families', 'Selected Area', 'Selected Groups', 'All Members'],
    default: 'All Members'
  },
  targetedMembers: [{ type: String }],
  targetAudiences: [{ type: String }], // Stores member IDs, group IDs, etc.
  
  settings: {
    showDonorNames: { type: Boolean, default: true },
    anonymousAllowed: { type: Boolean, default: true },
    enableProgressBar: { type: Boolean, default: true },
    enableDonationCounter: { type: Boolean, default: true },
    enableCountdown: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false }
  },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contributorsCount: { type: Number, default: 0 },
}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);
