const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const UserSubscription = require('./src/models/UserSubscription');

async function upgradeUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB. Upgrading all users to Premium...');

    const users = await User.find({});
    let count = 0;

    for (const user of users) {
      const existingSub = await UserSubscription.findOne({ userId: user._id });
      if (!existingSub) {
        await UserSubscription.create({
          userId: user._id,
          planId: new mongoose.Types.ObjectId(), // Fake plan ID for testing
          planName: 'Pro Supreme Plan',
          planType: 'premium',
          status: 'active',
          durationInDays: 365,
          pricePaid: 0,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          featuresSnapshot: {
            profileViewsPerDay: -1,
            interestLimit: -1,
            messageLimit: -1,
            advancedFilters: true,
            visitorHistory: true,
            chat: true,
            profileBoosts: 5,
            highlightProfile: true,
            priorityListing: true,
            contactDetailsAccess: true,
            unlimitedShortlist: true,
            readReceipts: true,
            profileBadge: true
          }
        });
        count++;
      } else {
        await UserSubscription.updateOne(
          { userId: user._id },
          { 
            $set: { 
              status: 'active',
              endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              'featuresSnapshot.chat': true 
            } 
          }
        );
        count++;
      }
    }

    console.log(`Successfully upgraded ${count} users to premium with active subscriptions.`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

upgradeUsers();
