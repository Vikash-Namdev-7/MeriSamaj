const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const MatrimonialProfile = require('./src/models/MatrimonialProfile');

async function migrateNames() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({
      $or: [
        { name: null },
        { name: '' },
        { name: { $exists: false } }
      ]
    });

    console.log(`Found ${users.length} users needing a name migration.`);

    for (let user of users) {
      let resolvedName = '';

      // 1. Matrimonial Profile
      const matProfile = await MatrimonialProfile.findOne({ userId: user._id });
      if (matProfile && matProfile.personal && matProfile.personal.fullName) {
        resolvedName = matProfile.personal.fullName;
      }

      // 2. Phone fallback
      if (!resolvedName) {
        resolvedName = `User ${user.phone.slice(-4)}`;
      }

      user.name = resolvedName;
      await user.save();
      console.log(`Updated user ${user._id} to name: ${resolvedName}`);
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateNames();
