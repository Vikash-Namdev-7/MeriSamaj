/**
 * verify_all_modules.js
 * Verifies database records across Events, Dharmashala, Matrimonial, Professional, and Campaign models.
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing in .env file!');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.\n');

  const Campaign = require('./src/models/Campaign');
  const Event = require('./src/models/Event');
  const Dharmashala = require('./src/models/Dharmashala');
  const MatrimonialProfile = require('./src/models/MatrimonialProfile');
  const Professional = require('./src/models/Professional');
  const User = require('./src/models/User');

  console.log('=== Database Verification Results ===');
  
  // 1. User & Community Count
  const totalUsers = await User.countDocuments({});
  const usersWithComm = await User.countDocuments({ communityId: { $ne: null } });
  console.log(`- Users: ${totalUsers} total | ${usersWithComm} with communityId set`);

  // 2. Campaigns
  const totalCampaigns = await Campaign.countDocuments({});
  const activeCampaigns = await Campaign.countDocuments({ status: { $in: ['Active', 'Published'] } });
  console.log(`- Campaigns: ${totalCampaigns} total | ${activeCampaigns} Active/Published`);

  // 3. Events
  const totalEvents = await Event.countDocuments({ isDeleted: { $ne: true } });
  console.log(`- Events (non-deleted): ${totalEvents}`);

  // 4. Dharmashalas
  const totalDharmashalas = await Dharmashala.countDocuments({});
  console.log(`- Dharmashalas: ${totalDharmashalas}`);

  // 5. Matrimonials
  const totalMatrimonials = await MatrimonialProfile.countDocuments({ isDeleted: false });
  const activeMatrimonials = await MatrimonialProfile.countDocuments({ isDeleted: false, status: 'active' });
  console.log(`- Matrimonial Profiles: ${totalMatrimonials} total | ${activeMatrimonials} Active`);

  // 6. Professionals
  const totalProfessionals = await Professional.countDocuments({ isDeleted: { $ne: true } });
  console.log(`- Professional Listings: ${totalProfessionals}`);

  await mongoose.disconnect();
  console.log('\nVerification run completed.');
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
