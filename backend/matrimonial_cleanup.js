/**
 * matrimonial_cleanup.js
 * Phase 1: Database cleanup for Matrimonial module.
 * - Archives orphan profiles (userId = null)
 * - Soft-archives duplicate profiles (keeps best per userId)
 * - Sets MatrimonialSettings.profileCompletionRequired = 50 (dev)
 *
 * Run: node matrimonial_cleanup.js
 * SAFE: Never hard-deletes. Sets isDeleted=true only on losers.
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MatrimonialProfile  = require('./src/models/MatrimonialProfile');
const MatrimonialSettings = require('./src/models/MatrimonialSettings');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ─── Step 1: Archive orphan profiles (userId = null) ─────────────────────
  const orphanResult = await MatrimonialProfile.updateMany(
    { userId: { $in: [null, undefined] }, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date(), status: 'deleted' } }
  );
  console.log(`\n🗑  Orphan profiles archived: ${orphanResult.modifiedCount}`);

  // ─── Step 2: Find all userId groups with duplicates ───────────────────────
  const duplicateGroups = await MatrimonialProfile.aggregate([
    { $match: { isDeleted: false, userId: { $ne: null } } },
    { $group: { _id: '$userId', count: { $sum: 1 }, ids: { $push: '$_id' } } },
    { $match: { count: { $gt: 1 } } }
  ]);

  console.log(`\n📋 User IDs with duplicate profiles: ${duplicateGroups.length}`);

  let keptCount = 0;
  let archivedCount = 0;

  for (const group of duplicateGroups) {
    // Load all profiles for this userId, sorted: highest completion first, then latest updatedAt
    const profiles = await MatrimonialProfile.find({
      userId: group._id,
      isDeleted: false
    }).sort({
      'profileCompletion.percentage': -1,
      updatedAt: -1
    });

    if (profiles.length <= 1) continue;

    const keeper = profiles[0];
    const losers = profiles.slice(1);

    console.log(`  → userId ${group._id}: keeping "${keeper.personal?.fullName}" (${keeper.profileCompletion?.percentage}%, updated ${keeper.updatedAt?.toISOString()?.split('T')[0]})`);

    for (const loser of losers) {
      await MatrimonialProfile.findByIdAndUpdate(loser._id, {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          status: 'deleted',
          updatedBy: null
        }
      });
      console.log(`    ↳ Archived: "${loser.personal?.fullName}" (${loser.profileCompletion?.percentage}%)`);
      archivedCount++;
    }
    keptCount++;
  }

  console.log(`\n✅ Duplicates resolved: ${keptCount} groups, ${archivedCount} profiles archived`);

  // ─── Step 3: Update MatrimonialSettings completion threshold ─────────────
  let settings = await MatrimonialSettings.findOne();
  if (!settings) {
    settings = new MatrimonialSettings();
  }
  const devCompletion = parseInt(process.env.MATRIMONIAL_MIN_COMPLETION) || 50;
  settings.profileCompletionRequired = devCompletion;
  await settings.save();
  console.log(`\n⚙  MatrimonialSettings.profileCompletionRequired set to ${devCompletion}%`);

  // ─── Final report ─────────────────────────────────────────────────────────
  const remaining = await MatrimonialProfile.countDocuments({ isDeleted: false });
  const searchable = await MatrimonialProfile.countDocuments({
    isDeleted: false,
    status: 'active',
    'profileCompletion.percentage': { $gte: devCompletion }
  });

  console.log(`\n📊 Final DB State:`);
  console.log(`   Active profiles:    ${remaining}`);
  console.log(`   Search-eligible:    ${searchable}`);
  console.log(`   Min completion req: ${devCompletion}%`);

  await mongoose.disconnect();
  console.log('\n✅ Cleanup complete. Disconnected from MongoDB.');
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
