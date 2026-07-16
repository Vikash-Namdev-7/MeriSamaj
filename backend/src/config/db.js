const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    if (!config.mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined!');
    }
    const conn = await mongoose.connect(config.mongoUri, {
      // Modern mongoose version doesn't require deprecated options
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default user for testing if it doesn't exist
    const User = require('../models/User');
    const defaultPhone = '9999999999';
    const defaultEmail = 'default@samaj.com';
    const defaultPassword = 'Password123';

    const userExists = await User.findOne({
      $or: [{ phone: defaultPhone }, { email: defaultEmail }]
    });

    if (!userExists) {
      await User.create({
        phone: defaultPhone,
        email: defaultEmail,
        password: defaultPassword, // Will be hashed automatically by pre-save hook
        name: 'Default Member',
        role: 'user',
        community: 'Agrawal Samaj',
        city: 'Indore',
        isVerified: true
      });
      console.log('Default Samaj Member seeded successfully (Phone: 9999999999, Email: default@samaj.com, Password: Password123).');
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exiting process on connection failure in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
