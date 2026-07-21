const mongoose = require('mongoose');

/**
 * MatrimonialSettings — Admin-configurable settings for the Matrimonial module.
 * Only ONE document should exist (singleton). Fetched and cached server-side.
 * Admin can update these values from the Admin Panel without code changes.
 */
const matrimonialSettingsSchema = new mongoose.Schema(
  {
    // ─── Profile Requirements ─────────────────────────────────────────────────
    profileCompletionRequired: { type: Number, default: 80 },   // % needed to appear in search
    maxPhotoUpload:            { type: Number, default: 6 },
    freeInterestLimit:         { type: Number, default: 5 },     // Per month for free users
    gracePeriodDays:           { type: Number, default: 3 },     // Post-expiry grace period
    allowProfileBoost:         { type: Boolean, default: true },

    // ─── Match Weight Configuration ───────────────────────────────────────────
    matchWeights: {
      community:  { type: Number, default: 20 },
      age:        { type: Number, default: 20 },
      education:  { type: Number, default: 15 },
      profession: { type: Number, default: 15 },
      location:   { type: Number, default: 10 },
      height:     { type: Number, default: 10 },
      lifestyle:  { type: Number, default: 10 }
    },

    // ─── Master Data Lists (Admin-manageable, no code change required) ────────
    educationList:    { type: [String], default: ['10th', '12th', 'Graduate', 'Post Graduate', 'PhD', 'Diploma', 'Other'] },
    professionList:   { type: [String], default: ['Business', 'Service', 'Self Employed', 'Student', 'Not Working', 'Other'] },
    maritalStatusList:{ type: [String], default: ['Never Married', 'Divorced', 'Widowed', 'Separated'] },
    religionList:     { type: [String], default: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other'] },
    dietList:         { type: [String], default: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian', 'Jain'] },
    familyTypeList:   { type: [String], default: ['Nuclear', 'Joint', 'Extended'] },
    familyValuesList: { type: [String], default: ['Traditional', 'Moderate', 'Liberal'] },

    // ─── Recommendation Weights ───────────────────────────────────────────────
    maxRecommendationsPerCategory: { type: Number, default: 10 },

    // ─── Audit ───────────────────────────────────────────────────────────────
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MatrimonialSettings', matrimonialSettingsSchema);
