const mongoose = require('mongoose');

const MatrimonialProfile = require('./src/models/MatrimonialProfile');

async function checkNansi() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/merisamaj');
    
    // Find Nansi's profile (assuming her name includes Nansi or we can just find the most recently created profile)
    const profile = await MatrimonialProfile.findOne().sort({ createdAt: -1 });
    console.log('Most recent MatrimonialProfile:');
    console.log('User ID:', profile.userId);
    console.log('Name:', profile.personal?.fullName);
    console.log('Completion %:', profile.profileCompletion?.percentage);
    console.log('Status:', profile.status);
    console.log('IsDeleted:', profile.isDeleted);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkNansi();
