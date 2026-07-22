/**
 * setup_test_data.js
 * Creates test member accounts and fixes existing matrimonial profile inconsistencies.
 * Run: node setup_test_data.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  const User = require('./src/models/User');
  const MatrimonialProfile = require('./src/models/MatrimonialProfile');

  // ─── 1. Fix maritalLifecycle undefined on existing profiles ──────────────
  console.log('=== FIXING maritalLifecycle undefined ===');
  const fix1 = await MatrimonialProfile.updateMany(
    { maritalLifecycle: { $exists: false } },
    { $set: { maritalLifecycle: 'single' } }
  );
  console.log(`  Fixed ${fix1.modifiedCount} profiles missing maritalLifecycle`);

  // ─── 2. Create Member A (Test user for matrimonial) ───────────────────────
  console.log('\n=== CREATING TEST MEMBERS ===');
  const Community = require('./src/models/Community');
  const defaultCommunity = await Community.findOne({}) || await Community.create({ name: 'Agrawal Samaj', city: 'Indore' });

  const testMembers = [
    { name: 'Anil Kumar Test', phone: '9990001111', password: 'Test@1234', role: 'user' },
    { name: 'Sunita Devi Test', phone: '9990002222', password: 'Test@1234', role: 'user' }
  ];

  for (const m of testMembers) {
    const exists = await User.findOne({ phone: m.phone });
    if (exists) {
      console.log(`  Member already exists: ${m.phone} (${exists.name})`);
    } else {
      const user = await User.create({
        ...m,
        communityId: defaultCommunity._id,
        community: defaultCommunity.name,
        accountStatus: 'active',
        verificationStatus: 'verified',
        isPhoneVerified: true,
        isEmailVerified: true
      });
      console.log(`  Created: ${user.phone} | ${user.name} | role=${user.role}`);
    }
  }

  // ─── 3. Reset admin password to known value ────────────────────────────────
  console.log('\n=== RESETTING ADMIN PASSWORD ===');
  const admin = await User.findOne({ phone: '7777777777' });
  if (admin) {
    admin.password = 'Admin@1234';
    await admin.save();
    console.log(`  Admin ${admin.phone} password reset to Admin@1234`);
  } else {
    console.log('  Admin 7777777777 not found');
  }

  // ─── 4. Reset head password ────────────────────────────────────────────────
  console.log('\n=== RESETTING HEAD PASSWORD ===');
  const head = await User.findOne({ phone: '8888888888' });
  if (head) {
    head.password = 'Head@1234';
    await head.save();
    console.log(`  Head ${head.phone} (${head.name}) password reset to Head@1234`);
  } else {
    console.log('  Head 8888888888 not found');
  }

  // ─── 5. Show existing matrimonial profiles ─────────────────────────────────
  console.log('\n=== EXISTING MATRIMONIAL PROFILES (after fix) ===');
  const profiles = await MatrimonialProfile.find({ isDeleted: false })
    .select('userId status verificationStatus maritalLifecycle profileCompletion')
    .populate('userId', 'name phone')
    .limit(8).lean();
  profiles.forEach(p => {
    const user = p.userId;
    console.log(`  ${user?.phone || 'no-user'} | "${user?.name}" | status=${p.status} | verified=${p.verificationStatus} | lifecycle=${p.maritalLifecycle} | ${p.profileCompletion?.percentage}%`);
  });

  // ─── 6. Summary ────────────────────────────────────────────────────────────
  console.log('\n=== TEST CREDENTIALS SUMMARY ===');
  console.log('  Member A : phone=9990001111 password=Test@1234');
  console.log('  Member B : phone=9990002222 password=Test@1234');
  console.log('  Admin    : phone=7777777777 password=Admin@1234');
  console.log('  Head     : phone=8888888888 password=Head@1234');

  await mongoose.disconnect();
  console.log('\nDone.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
