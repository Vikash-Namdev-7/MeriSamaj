const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = require('../config/config');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

async function cleanCollections() {
  try {
    const mongoUri = config.mongoUri || process.env.MONGO_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected.');

    const campaignRes = await Campaign.deleteMany({});
    console.log(`Cleared ${campaignRes.deletedCount} documents from Campaign collection.`);

    const donationRes = await Donation.deleteMany({});
    console.log(`Cleared ${donationRes.deletedCount} documents from Donation collection.`);

    console.log('Donation data cleanup complete. Fresh start ready!');
  } catch (err) {
    console.error('Data cleanup error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanCollections();
