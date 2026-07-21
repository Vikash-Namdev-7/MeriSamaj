/**
 * find_test_users.js
 * Finds real users in MongoDB to use for audit testing.
 * Run: node find_test_users.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  const User = require('./src/models/User');

  // Find users of each role
  const members = await User.find({ role: 'member', accountStatus: 'active' })
    .select('name phone email role accountStatus communityId')
    .limit(3).lean();

  const admins = await User.find({ role: { $in: ['admin', 'super_admin', 'master_admin'] } })
    .select('name phone email role accountStatus')
    .limit(2).lean();

  const heads = await User.find({ role: 'head', accountStatus: 'active' })
    .select('name phone email role accountStatus communityId')
    .limit(2).lean();

  console.log('=== MEMBERS ===');
  members.forEach(u => console.log(`  phone=${u.phone} | name="${u.name}" | status=${u.accountStatus} | communityId=${u.communityId}`));

  console.log('\n=== ADMINS ===');
  admins.forEach(u => console.log(`  phone=${u.phone} | name="${u.name}" | role=${u.role} | status=${u.accountStatus}`));

  console.log('\n=== HEADS ===');
  heads.forEach(u => console.log(`  phone=${u.phone} | name="${u.name}" | role=${u.role} | status=${u.accountStatus} | communityId=${u.communityId}`));

  // Also find matrimonial profiles to see what's in DB
  const MatrimonialProfile = require('./src/models/MatrimonialProfile');
  const profiles = await MatrimonialProfile.find({ isDeleted: false })
    .select('userId status verificationStatus maritalLifecycle profileCompletion')
    .populate('userId', 'name phone')
    .limit(5).lean();

  console.log('\n=== MATRIMONIAL PROFILES ===');
  profiles.forEach(p => {
    console.log(`  userId=${p.userId?.phone || p.userId} | name="${p.userId?.name}" | status=${p.status} | verification=${p.verificationStatus} | lifecycle=${p.maritalLifecycle} | completion=${p.profileCompletion?.percentage}%`);
  });

  // MatrimonialSettings
  const MatrimonialSettings = require('./src/models/MatrimonialSettings');
  const settings = await MatrimonialSettings.findOne().lean();
  console.log('\n=== MATRIMONIAL SETTINGS ===');
  console.log(`  profileCompletionRequired=${settings?.profileCompletionRequired}`);
  console.log(`  maxRecommendationsPerCategory=${settings?.maxRecommendationsPerCategory}`);

  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
