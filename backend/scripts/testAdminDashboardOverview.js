const mongoose = require('mongoose');
const User = require('../src/models/User');
const Community = require('../src/models/Community');
const MatrimonialProfile = require('../src/models/MatrimonialProfile');
const Event = require('../src/models/Event');
const Professional = require('../src/models/Professional');
const Obituary = require('../src/models/Obituary');
const Post = require('../src/models/Post');
const Voting = require('../src/models/Voting');
const Donation = require('../src/models/Donation');
const Contribution = require('../src/models/Contribution');
const DharmashalaBooking = require('../src/models/DharmashalaBooking');
const Expense = require('../src/models/Expense');
const adminController = require('../src/controllers/admin/adminController');

console.log('====================================================');
console.log('📊 ADMIN DASHBOARD OVERVIEW REAL MODEL QUERY TEST');
console.log('====================================================\n');

async function testAdminDashboard() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/merisamaj';
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.\n');

    let responseData = null;
    const req = {};
    const res = {
      status: () => res,
      json: (payload) => {
        responseData = payload;
        return res;
      }
    };

    await adminController.getDashboardOverview(req, res);

    if (responseData && responseData.status === 'success') {
      const d = responseData.data;
      console.log('✅ PASS: getDashboardOverview executed successfully!');
      console.log('----------------------------------------------------');
      console.log(`1. Members Total:       ${d.members.total} (Verified: ${d.members.verified}, Active: ${d.members.active})`);
      console.log(`2. Communities Total:   ${d.communities.total} (Active: ${d.communities.active})`);
      console.log(`3. Cities Total:        ${d.cities.total}`);
      console.log(`4. Active Heads:        ${d.heads.active} (Roles: 'head', 'sub_head')`);
      console.log(`5. Matrimonial Stats:   ${d.matrimonial.total} profiles (${d.matrimonial.verified} verified, ${d.matrimonial.single} searching)`);
      console.log(`6. Event Stats:         ${d.events.total} events (${d.events.active} active, ${d.events.completed} completed)`);
      console.log(`7. Professional Stats:  ${d.professionals.total} listings (${d.professionals.approved} approved)`);
      console.log(`8. Engagement Overview: ${d.engagement.posts} posts, ${d.engagement.likes} likes, ${d.engagement.comments} comments, ${d.engagement.rsvps} RSVPs, ${d.engagement.elections} elections`);
      console.log(`9. Obituaries Total:    ${d.obituaries.total}`);
      console.log(`10. Combined Revenue:   ₹${d.revenue.total} (Donations: ₹${d.revenue.donations}, Contributions: ₹${d.revenue.contributions}, Dharmashala: ₹${d.revenue.dharmashala})`);
      console.log('----------------------------------------------------\n');
    } else {
      console.log('❌ FAIL: getDashboardOverview returned error status.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testAdminDashboard().catch(console.error);
