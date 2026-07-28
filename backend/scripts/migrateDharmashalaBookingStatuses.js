const mongoose = require('mongoose');
require('dotenv').config();
const DharmashalaBooking = require('../src/models/DharmashalaBooking');

async function migrateDharmashalaBookingStatuses() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/merisamaj';
  console.log(`Connecting to Mongo at ${mongoUri}...`);
  await mongoose.connect(mongoUri);

  try {
    console.log('Migrating DharmashalaBooking statuses...');

    // 1. Convert legacy payment_pending to approved with paymentStatus Pending
    const res1 = await DharmashalaBooking.updateMany(
      { status: 'payment_pending' },
      { $set: { status: 'approved', paymentStatus: 'Pending' } }
    );
    console.log(`Updated legacy 'payment_pending' to 'approved': ${res1.modifiedCount} records`);

    // 2. Convert legacy paid status to confirmed with paymentStatus Paid
    const res2 = await DharmashalaBooking.updateMany(
      { status: 'paid' },
      { $set: { status: 'confirmed', paymentStatus: 'Paid' } }
    );
    console.log(`Updated legacy 'paid' to 'confirmed': ${res2.modifiedCount} records`);

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  migrateDharmashalaBookingStatuses();
}

module.exports = migrateDharmashalaBookingStatuses;
