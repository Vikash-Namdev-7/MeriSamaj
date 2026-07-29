const mongoose = require('mongoose');

/**
 * UserPushToken — Stores FCM / Web Push tokens per user/device.
 */
const userPushTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fcmToken: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    deviceType: {
      type: String,
      enum: ['web', 'android', 'ios'],
      default: 'web'
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

userPushTokenSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('UserPushToken', userPushTokenSchema);
