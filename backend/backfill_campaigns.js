/**
 * backfill_campaigns.js
 * Backfills status of all Draft campaigns in database to Published/Active so they are visible to members.
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

  console.log('Searching for campaigns with Draft status...');
  const drafts = await Campaign.find({ status: 'Draft' });
  console.log(`Found ${drafts.length} campaigns in Draft status.`);

  if (drafts.length > 0) {
    const res = await Campaign.updateMany(
      { status: 'Draft' },
      { $set: { status: 'Published' } }
    );
    console.log(`Successfully updated ${res.modifiedCount} campaigns to 'Published' status.`);
  }

  await mongoose.disconnect();
  console.log('\nData backfill completed.');
}

main().catch(err => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
