const mongoose = require('mongoose');

const eventActivityLogSchema = new mongoose.Schema({
  actor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    role: { type: String, required: true } // 'admin', 'head', 'member'
  },
  action: { 
    type: String, 
    required: true,
    enum: ['Create', 'Update', 'Delete', 'Feature', 'Unfeature', 'Status Change', 'RSVP Join', 'RSVP Leave', 'Interest Join', 'Interest Leave']
  },
  event: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    title: { type: String, required: true }
  },
  community: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    name: { type: String }
  },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

eventActivityLogSchema.index({ timestamp: -1 });
eventActivityLogSchema.index({ 'event.id': 1 });

module.exports = mongoose.model('EventActivityLog', eventActivityLogSchema);
