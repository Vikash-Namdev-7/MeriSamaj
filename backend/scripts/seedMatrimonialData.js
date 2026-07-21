/**
 * seedMatrimonialData.js
 * Seeds initial Subscription Plans and MatrimonialSettings into MongoDB.
 * Run: node scripts/seedMatrimonialData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const SubscriptionPlan    = require('../src/models/SubscriptionPlan');
const MatrimonialSettings = require('../src/models/MatrimonialSettings');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ─── Subscription Plans ────────────────────────────────────────────────────
  await SubscriptionPlan.deleteMany({});
  await SubscriptionPlan.insertMany([
    {
      name:           'Free',
      description:    'Basic access to the matrimonial module.',
      price:          0,
      durationInDays: 0,
      displayOrder:   1,
      isActive:       true,
      isFeatured:     false,
      features: {
        profileViewsPerDay:   10,
        interestLimit:        5,
        messageLimit:         -1,
        advancedFilters:      false,
        visitorHistory:       false,
        chat:                 false,
        profileBoosts:        0,
        highlightProfile:     false,
        priorityListing:      false,
        contactDetailsAccess: false,
        unlimitedShortlist:   false,
        readReceipts:         false,
        profileBadge:         false
      }
    },
    {
      name:           'Premium Monthly',
      description:    'All premium features for 30 days.',
      price:          499,
      durationInDays: 30,
      displayOrder:   2,
      isActive:       true,
      isFeatured:     false,
      features: {
        profileViewsPerDay:   -1,
        interestLimit:        -1,
        messageLimit:         -1,
        advancedFilters:      true,
        visitorHistory:       true,
        chat:                 true,
        profileBoosts:        5,
        highlightProfile:     true,
        priorityListing:      true,
        contactDetailsAccess: true,
        unlimitedShortlist:   true,
        readReceipts:         true,
        profileBadge:         true
      }
    },
    {
      name:           'Premium Quarterly',
      description:    'All premium features for 90 days — best value!',
      price:          1299,
      durationInDays: 90,
      displayOrder:   3,
      isActive:       true,
      isFeatured:     true,
      features: {
        profileViewsPerDay:   -1,
        interestLimit:        -1,
        messageLimit:         -1,
        advancedFilters:      true,
        visitorHistory:       true,
        chat:                 true,
        profileBoosts:        15,
        highlightProfile:     true,
        priorityListing:      true,
        contactDetailsAccess: true,
        unlimitedShortlist:   true,
        readReceipts:         true,
        profileBadge:         true
      }
    },
    {
      name:           'Premium Yearly',
      description:    'All premium features for 365 days — maximum savings!',
      price:          3999,
      durationInDays: 365,
      displayOrder:   4,
      isActive:       true,
      isFeatured:     false,
      features: {
        profileViewsPerDay:   -1,
        interestLimit:        -1,
        messageLimit:         -1,
        advancedFilters:      true,
        visitorHistory:       true,
        chat:                 true,
        profileBoosts:        60,
        highlightProfile:     true,
        priorityListing:      true,
        contactDetailsAccess: true,
        unlimitedShortlist:   true,
        readReceipts:         true,
        profileBadge:         true
      }
    }
  ]);
  console.log('✅ Subscription Plans seeded (4 plans)');

  // ─── Matrimonial Settings (singleton) ────────────────────────────────────
  await MatrimonialSettings.deleteMany({});
  await MatrimonialSettings.create({
    profileCompletionRequired: 80,
    maxPhotoUpload: 6,
    freeInterestLimit: 5,
    gracePeriodDays: 3,
    allowProfileBoost: true,
    matchWeights: {
      community: 20, age: 20, education: 15, profession: 15,
      location: 10, height: 10, lifestyle: 10
    },
    educationList:    ['10th', '12th', 'Graduate', 'Post Graduate', 'PhD', 'Diploma', 'Other'],
    professionList:   ['Business', 'Service', 'Self Employed', 'Student', 'Not Working', 'Other'],
    maritalStatusList:['Never Married', 'Divorced', 'Widowed', 'Separated'],
    religionList:     ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other'],
    dietList:         ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Eggetarian', 'Jain'],
    familyTypeList:   ['Nuclear', 'Joint', 'Extended'],
    familyValuesList: ['Traditional', 'Moderate', 'Liberal'],
    maxRecommendationsPerCategory: 10
  });
  console.log('✅ MatrimonialSettings seeded (singleton)');

  await mongoose.disconnect();
  console.log('🎉 Seed completed!');
};

run().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
