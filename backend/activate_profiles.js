const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MatrimonialProfile = require('./src/models/MatrimonialProfile');

async function activateProfiles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await MatrimonialProfile.updateMany(
      { status: 'draft' },
      { $set: { status: 'active' } }
    );
    console.log(`Activated ${result.modifiedCount} profiles.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

activateProfiles();
