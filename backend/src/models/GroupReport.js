const mongoose = require('mongoose');

const groupReportSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true, index: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null }, // Optional, if reporting a specific message
    reason: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending', index: true },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('GroupReport', groupReportSchema);
