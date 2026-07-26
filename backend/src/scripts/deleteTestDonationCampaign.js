const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');

// SRV URI and Standard Direct Fallback URI for MongoDB Atlas (bypasses Windows DNS ECONNREFUSED)
const PRIMARY_MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://vikashnamdev1111_db_user:vicky123@cluster0.0balpuc.mongodb.net';
const FALLBACK_MONGO_URI = 'mongodb://vikashnamdev1111_db_user:vicky123@ac-4zccviq-shard-00-00.0balpuc.mongodb.net:27017,ac-4zccviq-shard-00-01.0balpuc.mongodb.net:27017,ac-4zccviq-shard-00-02.0balpuc.mongodb.net:27017/merisamaj?ssl=true&replicaSet=atlas-m0z04z-shard-0&authSource=admin';

async function connectDB() {
  try {
    console.log('Connecting to MongoDB via primary URI...');
    await mongoose.connect(PRIMARY_MONGO_URI);
    console.log('MongoDB Connected via primary URI.');
  } catch (err) {
    console.warn('Primary SRV connection failed:', err.message);
    console.log('Attempting connection via fallback standard URI...');
    await mongoose.connect(FALLBACK_MONGO_URI);
    console.log('MongoDB Connected via fallback standard URI.');
  }
}

async function deleteTestDonations() {
  try {
    await connectDB();

    const query = {
      $or: [
        { title: new RegExp('oiuytfd', 'i') },
        { description: new RegExp('oiuytre', 'i') }
      ]
    };

    const campaignRes = await Campaign.deleteMany(query);
    console.log(`Deleted ${campaignRes.deletedCount} matching Campaign document(s).`);

    const donationRes = await Donation.deleteMany(query);
    console.log(`Deleted ${donationRes.deletedCount} matching Donation document(s).`);

    console.log('Cleanup completed successfully.');
  } catch (error) {
    console.error('Error during cleanup:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

deleteTestDonations();
