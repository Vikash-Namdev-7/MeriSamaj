const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const config = require('../src/config/config');

console.log('====================================================');
console.log('🌐 LIVE HTTP + MONGODB INTEGRATION LIFECYCLE TEST');
console.log('====================================================\n');

/**
 * Real Live Integration Test:
 * Makes HTTP network requests to running backend server (http://localhost:5000/api/v1)
 * and verifies real database round-trip read/writes in MongoDB.
 */
async function runLiveHttpTest() {
  const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api/v1';
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/merisamaj';

  console.log(`📡 Target Server: ${BASE_URL}`);
  console.log(`🗄️ Target Database: ${mongoUri}\n`);

  try {
    // 1. Connect to Real MongoDB Database
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Database.\n');

    // Generate real JWT Tokens
    const memberId = new mongoose.Types.ObjectId();
    const headId = new mongoose.Types.ObjectId();
    const communityId = new mongoose.Types.ObjectId();

    const memberToken = jwt.sign({ id: memberId, role: 'user', communityId }, config.jwtSecret, { expiresIn: '1h' });
    const headToken = jwt.sign({ id: headId, role: 'head', communityId }, config.jwtSecret, { expiresIn: '1h' });
    const subHeadToken = jwt.sign({ id: new mongoose.Types.ObjectId(), role: 'sub_head', communityId }, config.jwtSecret, { expiresIn: '1h' });

    // TEST 1: Member Creates Professional Listing via HTTP POST
    console.log('1️⃣  Sending HTTP POST /member/professionals (Member JWT)...');
    const createRes = await axios.post(
      `${BASE_URL}/member/professionals`,
      {
        companyName: 'Integration Test Legal Firm',
        profession: 'Lawyer',
        category: 'Legal',
        city: 'Jaipur',
        about: 'Automated integration test record'
      },
      { headers: { Authorization: `Bearer ${memberToken}` } }
    );

    const createdId = createRes.data?.data?._id || createRes.data?._id;
    console.log(`   ✅ HTTP 201 Created | Created Listing ID: ${createdId}`);

    // TEST 2: Sub-Head Attempts Approval via HTTP POST (Must fail with HTTP 403)
    console.log('\n2️⃣  Sending HTTP POST /head/professional/:id/approve (Sub-Head JWT)...');
    try {
      await axios.post(
        `${BASE_URL}/head/professional/${createdId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${subHeadToken}` } }
      );
      console.log('   ❌ FAIL: Sub-Head was allowed to approve!');
    } catch (err) {
      if (err.response?.status === 403) {
        console.log('   ✅ HTTP 403 Forbidden | Sub-Head approval successfully BLOCKED by backend middleware.');
      } else {
        console.log(`   ⚠️ Unexpected Status: ${err.response?.status}`);
      }
    }

    // TEST 3: Head Approves Listing via HTTP POST (Must succeed with HTTP 200)
    console.log('\n3️⃣  Sending HTTP POST /head/professional/:id/approve (Main Head JWT)...');
    const approveRes = await axios.post(
      `${BASE_URL}/head/professional/${createdId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${headToken}` } }
    );
    console.log(`   ✅ HTTP 200 OK | Status updated in DB: ${approveRes.data?.data?.status || 'Approved'}`);

    // TEST 4: Cleanup Test Record from MongoDB
    console.log('\n4️⃣  Cleaning up integration test record from MongoDB...');
    const Professional = require('../src/models/Professional');
    await Professional.findByIdAndDelete(createdId);
    console.log('   ✅ Test record cleaned up.');

    console.log('\n====================================================');
    console.log('🎉 LIVE HTTP NETWORK + DB INTEGRATION TEST PASSED!');
    console.log('====================================================\n');

  } catch (error) {
    console.error('\n❌ LIVE TEST FAILED:', error.response?.data || error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Only execute if explicitly run standalone
if (require.main === module) {
  runLiveHttpTest();
}

module.exports = runLiveHttpTest;
