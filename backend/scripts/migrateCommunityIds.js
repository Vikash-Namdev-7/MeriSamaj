/**
 * Migration Script: Populate communityId (ObjectId) from community (String)
 *
 * Run this script ONCE after deploying the new Community model.
 *
 * What it does:
 *   Step 1: Create Community documents from all unique community strings in User collection
 *   Step 2: Update User.communityId from matched Community documents
 *   Step 3: Update Campaign.communityId from matched Community documents
 *   Step 4: Update Obituary.communityId from matched Community documents
 *   Step 5: Update Dharmashala.communityId from matched Community documents
 *   Step 6: Update Invitation.communityId from creator's communityId
 *   Step 7: Update Donation.communityId from parent Campaign's communityId
 *   Step 8: Update Expense.communityId from parent Campaign's communityId
 *   Step 9: Update DharmashalaBooking.communityId from parent Dharmashala's communityId
 *
 * Usage:
 *   node backend/scripts/migrateCommunityIds.js
 *
 * Safe to re-run — uses upsert logic and skips already-migrated documents.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

// Load all models
const Community = require('../src/models/Community');
const User = require('../src/models/User');
const Campaign = require('../src/models/Campaign');
const Obituary = require('../src/models/Obituary');
const Dharmashala = require('../src/models/Dharmashala');
const Invitation = require('../src/models/Invitation');
const Donation = require('../src/models/Donation');
const Expense = require('../src/models/Expense');
const DharmashalaBooking = require('../src/models/DharmashalaBooking');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const log = (msg) => console.log(`[MIGRATION] ${msg}`);
const warn = (msg) => console.warn(`[WARNING]   ${msg}`);

const run = async () => {
  if (!MONGODB_URI) {
    console.error('[ERROR] MONGODB_URI not set in .env file');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  log('Connected to MongoDB');

  const summary = {
    communitiesCreated: 0,
    usersUpdated: 0,
    campaignsUpdated: 0,
    obituariesUpdated: 0,
    dharmashalasUpdated: 0,
    invitationsUpdated: 0,
    donationsUpdated: 0,
    expensesUpdated: 0,
    bookingsUpdated: 0,
    skipped: 0,
    errors: [],
  };

  // ──────────────────────────────────────────────────────────────────
  // STEP 1: Collect all unique community strings from Users
  // ──────────────────────────────────────────────────────────────────
  log('Step 1: Discovering unique community strings from Users...');
  const uniqueCommunities = await User.distinct('community');
  const validCommunities = uniqueCommunities.filter(c => c && c.trim());
  log(`  Found ${validCommunities.length} unique community strings: ${validCommunities.join(', ')}`);

  // Also collect from Campaign and Dharmashala (in case any are missing from Users)
  const campaignCommunities = await Campaign.distinct('community');
  const dharmashalaComms = await Dharmashala.distinct('community');
  const obituaryCommunities = await Obituary.distinct('community');
  
  const allCommunityStrings = [
    ...new Set([
      ...validCommunities,
      ...campaignCommunities.filter(Boolean),
      ...dharmashalaComms.filter(Boolean),
      ...obituaryCommunities.filter(Boolean),
    ])
  ].filter(c => c && c.trim());
  
  log(`  Total unique community names: ${allCommunityStrings.length}`);

  // ──────────────────────────────────────────────────────────────────
  // STEP 2: Create Community documents (upsert by name)
  // ──────────────────────────────────────────────────────────────────
  log('Step 2: Creating/upserting Community documents...');
  const communityMap = {}; // { "Namdev Samaj": ObjectId }

  for (const name of allCommunityStrings) {
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').trim();
      const comm = await Community.findOneAndUpdate(
        { name },
        { $setOnInsert: { name, slug, isActive: true } },
        { upsert: true, new: true }
      );
      communityMap[name] = comm._id;
      if (comm.isNew || !communityMap[name]) summary.communitiesCreated++;
      log(`  ✓ Community: "${name}" → ${comm._id}`);
    } catch (err) {
      warn(`  Failed to create community "${name}": ${err.message}`);
      summary.errors.push(`Community create failed: ${name}`);
    }
  }

  // ──────────────────────────────────────────────────────────────────
  // STEP 3: Update Users
  // ──────────────────────────────────────────────────────────────────
  log('Step 3: Updating Users.communityId...');
  const users = await User.find({ communityId: null, community: { $exists: true, $ne: '' } });
  log(`  ${users.length} users need communityId update`);

  for (const user of users) {
    const cid = communityMap[user.community];
    if (!cid) {
      warn(`  No Community found for user "${user.name}" (community: "${user.community}")`);
      summary.skipped++;
      continue;
    }
    await User.findByIdAndUpdate(user._id, { communityId: cid });
    summary.usersUpdated++;
  }

  // ──────────────────────────────────────────────────────────────────
  // STEP 4: Update Campaigns
  // ──────────────────────────────────────────────────────────────────
  log('Step 4: Updating Campaigns.communityId...');
  const campaigns = await Campaign.find({ communityId: null, community: { $exists: true, $ne: '' } });
  log(`  ${campaigns.length} campaigns need communityId update`);

  for (const c of campaigns) {
    const cid = communityMap[c.community];
    if (!cid) { summary.skipped++; continue; }
    await Campaign.findByIdAndUpdate(c._id, { communityId: cid });
    summary.campaignsUpdated++;
  }

  // ──────────────────────────────────────────────────────────────────
  // STEP 5: Update Obituaries
  // ──────────────────────────────────────────────────────────────────
  log('Step 5: Updating Obituaries.communityId...');
  const obituaries = await Obituary.find({ communityId: null, community: { $exists: true, $ne: '' } });
  log(`  ${obituaries.length} obituaries need communityId update`);

  for (const o of obituaries) {
    const cid = communityMap[o.community];
    if (!cid) { summary.skipped++; continue; }
    await Obituary.findByIdAndUpdate(o._id, { communityId: cid });
    summary.obituariesUpdated++;
  }

  // ──────────────────────────────────────────────────────────────────
  // STEP 6: Update Dharmashalas
  // ──────────────────────────────────────────────────────────────────
  log('Step 6: Updating Dharmashalas.communityId...');
  const dharmashalas = await Dharmashala.find({ communityId: null, community: { $exists: true, $ne: '' } });
  log(`  ${dharmashalas.length} dharmashalas need communityId update`);

  for (const d of dharmashalas) {
    const cid = communityMap[d.community];
    if (!cid) { summary.skipped++; continue; }
    await Dharmashala.findByIdAndUpdate(d._id, { communityId: cid });
    summary.dharmashalasUpdated++;
  }

  // ──────────────────────────────────────────────────────────────────
  // STEP 7: Update Invitations (from creator's communityId)
  // ──────────────────────────────────────────────────────────────────
  log('Step 7: Updating Invitations.communityId from creator...');
  const invitations = await Invitation.find({ communityId: null }).populate('creatorId', 'communityId');
  log(`  ${invitations.length} invitations need communityId update`);

  for (const inv of invitations) {
    const creatorCid = inv.creatorId?.communityId;
    if (!creatorCid) { summary.skipped++; continue; }
    await Invitation.findByIdAndUpdate(inv._id, { communityId: creatorCid });
    summary.invitationsUpdated++;
  }

  // ──────────────────────────────────────────────────────────────────
  // STEP 8: Update Donations (from parent Campaign's communityId)
  // ──────────────────────────────────────────────────────────────────
  log('Step 8: Updating Donations.communityId from campaign...');
  const donations = await Donation.find({ communityId: null }).populate('campaign', 'communityId');
  log(`  ${donations.length} donations need communityId update`);

  for (const d of donations) {
    const campCid = d.campaign?.communityId;
    if (!campCid) { summary.skipped++; continue; }
    await Donation.findByIdAndUpdate(d._id, { communityId: campCid });
    summary.donationsUpdated++;
  }

  // ──────────────────────────────────────────────────────────────────
  // STEP 9: Update Expenses (from parent Campaign's communityId)
  // ──────────────────────────────────────────────────────────────────
  log('Step 9: Updating Expenses.communityId from campaign...');
  const expenses = await Expense.find({ communityId: null }).populate('campaign', 'communityId');
  log(`  ${expenses.length} expenses need communityId update`);

  for (const e of expenses) {
    const campCid = e.campaign?.communityId;
    if (!campCid) { summary.skipped++; continue; }
    await Expense.findByIdAndUpdate(e._id, { communityId: campCid });
    summary.expensesUpdated++;
  }

  // ──────────────────────────────────────────────────────────────────
  // STEP 10: Update DharmashalaBookings (from parent Dharmashala's communityId)
  // ──────────────────────────────────────────────────────────────────
  log('Step 10: Updating DharmashalaBookings.communityId from dharmashala...');
  const bookings = await DharmashalaBooking.find({ communityId: null }).populate('dharmashala', 'communityId');
  log(`  ${bookings.length} bookings need communityId update`);

  for (const b of bookings) {
    const dhCid = b.dharmashala?.communityId;
    if (!dhCid) { summary.skipped++; continue; }
    await DharmashalaBooking.findByIdAndUpdate(b._id, { communityId: dhCid });
    summary.bookingsUpdated++;
  }

  // ──────────────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('         MIGRATION SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`  Communities created/found : ${Object.keys(communityMap).length}`);
  console.log(`  Users updated             : ${summary.usersUpdated}`);
  console.log(`  Campaigns updated         : ${summary.campaignsUpdated}`);
  console.log(`  Obituaries updated        : ${summary.obituariesUpdated}`);
  console.log(`  Dharmashalas updated      : ${summary.dharmashalasUpdated}`);
  console.log(`  Invitations updated       : ${summary.invitationsUpdated}`);
  console.log(`  Donations updated         : ${summary.donationsUpdated}`);
  console.log(`  Expenses updated          : ${summary.expensesUpdated}`);
  console.log(`  Bookings updated          : ${summary.bookingsUpdated}`);
  console.log(`  Skipped (no match)        : ${summary.skipped}`);
  if (summary.errors.length > 0) {
    console.log(`  Errors                    : ${summary.errors.length}`);
    summary.errors.forEach(e => console.log(`    - ${e}`));
  }
  console.log('═══════════════════════════════════════');
  console.log('\n✅ Migration complete!');
  console.log('Next steps:');
  console.log('  1. Verify communityId is populated on all documents');
  console.log('  2. Test member login — verify community-scoped data');
  console.log('  3. After verification, schedule removal of deprecated String fields');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error('[FATAL]', err);
  mongoose.disconnect();
  process.exit(1);
});
