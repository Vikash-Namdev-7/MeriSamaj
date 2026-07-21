const mongoose = require('mongoose');
require('dotenv').config();

const MatrimonialProfile = require('./src/models/MatrimonialProfile');
const MatrimonialSettings = require('./src/models/MatrimonialSettings');

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Check settings
  const settings = await MatrimonialSettings.findOne().lean();
  console.log('=== MatrimonialSettings ===');
  console.log('profileCompletionRequired:', settings?.profileCompletionRequired ?? 'NOT SET (defaults to 80)');
  
  // Search query - exactly what the search API uses
  const completionRequired = settings?.profileCompletionRequired ?? 50;
  console.log('Effective completion required:', completionRequired);
  
  const query = {
    isDeleted: false,
    status: 'active',
    'profileCompletion.percentage': { $gte: completionRequired }
  };
  
  const total = await MatrimonialProfile.countDocuments(query);
  const profiles = await MatrimonialProfile.find(query).select('personal.fullName profileCompletion.percentage status visibility').lean();
  
  console.log('\n=== Search Results (all users, no block filter) ===');
  console.log('Total matching search query:', total);
  profiles.forEach(p => console.log('-', p.personal?.fullName, '|', p.profileCompletion?.percentage + '%', '|', p.visibility));
  
  // Check for duplicate profiles
  const nansiProfiles = await MatrimonialProfile.find({'personal.fullName': /nansi/i}).lean();
  console.log('\n=== Nansi profiles found:', nansiProfiles.length);
  nansiProfiles.forEach(p => console.log(' ID:', p._id, '| Completion:', p.profileCompletion?.percentage, '| Status:', p.status, '| Visibility:', p.visibility));
  
  // Check duplicate userId profiles
  const pipeline = [
    { $group: { _id: '$userId', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ];
  const duplicateUsers = await MatrimonialProfile.aggregate(pipeline);
  console.log('\n=== Duplicate userId profiles (should be 0):', duplicateUsers.length);
  duplicateUsers.forEach(d => console.log(' userId:', d._id, 'count:', d.count));
  
  await mongoose.disconnect();
}
check().catch(e => { console.error(e.message); process.exit(1); });
