const mongoose = require('mongoose');

const headActivityLogSchema = new mongoose.Schema(
  {
    headId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
      index: true
    },
    module: {
      type: String,
      required: true,
      enum: [
        'Dashboard', 'Members', 'Matrimonial', 'Events', 
        'Donations', 'Invitations', 'Directory', 'System'
      ]
    },
    action: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    affectedRecordId: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for faster querying
headActivityLogSchema.index({ createdAt: -1 });

const HeadActivityLog = mongoose.model('HeadActivityLog', headActivityLogSchema);

module.exports = HeadActivityLog;
