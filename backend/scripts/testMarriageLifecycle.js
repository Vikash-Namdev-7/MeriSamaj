const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const API_URL = 'http://localhost:5001/api/v1';

async function fetchAPI(endpoint, method, token, body) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

async function runTest() {
  console.log('--- Starting Automated Marriage Lifecycle API Test ---');
  
  // Connect to DB directly to create test users/profiles easily and verify them
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/merisamaj');
  console.log('Connected to DB');

  const User = require('../src/models/User');
  const MatrimonialProfile = require('../src/models/MatrimonialProfile');
  const InterestRequest = require('../src/models/InterestRequest');
  const MarriageRequest = require('../src/models/MarriageRequest');
  const Conversation = require('../src/models/Conversation');
  
  // Cleanup previous test data
  await User.deleteMany({ email: { $in: ['testgroom@example.com', 'testbride@example.com'] } });
  
  // 1. Create Users
  const groom = await User.create({ name: 'Test Groom', email: 'testgroom@example.com', phone: '9999999991', password: 'password123', gender: 'male', isVerified: true });
  const bride = await User.create({ name: 'Test Bride', email: 'testbride@example.com', phone: '9999999992', password: 'password123', gender: 'female', isVerified: true });
  
  const jwt = require('jsonwebtoken');
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
  const tGroom = jwt.sign({ id: groom._id }, jwtSecret, { expiresIn: '1d' });
  const tBride = jwt.sign({ id: bride._id }, jwtSecret, { expiresIn: '1d' });

  try {
    // 2. Create Profiles
    console.log('Creating profiles...');
    await MatrimonialProfile.create({
      userId: groom._id, status: 'active', verificationStatus: 'verified', maritalLifecycle: 'single', isClosed: false,
      personal: { fullName: 'Test Groom', gender: 'male', dateOfBirth: new Date('1990-01-01') },
      profileCompletion: { percentage: 100 }
    });
    
    const brideProfile = await MatrimonialProfile.create({
      userId: bride._id, status: 'active', verificationStatus: 'verified', maritalLifecycle: 'single', isClosed: false,
      personal: { fullName: 'Test Bride', gender: 'female', dateOfBirth: new Date('1992-01-01') },
      profileCompletion: { percentage: 100 }
    });

    // 3. Send Interest (Groom -> Bride)
    console.log('Sending interest...');
    const interestRes = await fetchAPI('/member/matrimonial/interests/send', 'POST', tGroom, { receiverProfileId: brideProfile._id, message: 'Hi' });
    const interestId = interestRes.data.interest._id;

    // 4. Accept Interest (Bride accepts)
    console.log('Accepting interest...');
    await fetchAPI(`/member/matrimonial/interests/accept/${interestId}`, 'POST', tBride, {});

    // Verify Connected Status
    const pGroom = await MatrimonialProfile.findOne({ userId: groom._id });
    const pBride = await MatrimonialProfile.findOne({ userId: bride._id });
    if (pGroom.maritalLifecycle !== 'connected' || pBride.maritalLifecycle !== 'connected') {
      throw new Error('Profiles not marked as connected after interest accept');
    }
    console.log('Profiles are connected!');

    // 5. Send Marriage Request (Groom -> Bride)
    console.log('Sending marriage request...');
    const marriageRes = await fetchAPI('/member/matrimonial/marriage/request', 'POST', tGroom, { message: 'Let us marry' });
    const marriageRequestId = marriageRes.data.request._id;

    // 6. Accept Marriage Request (Bride accepts)
    console.log('Accepting marriage request...');
    await fetchAPI(`/member/matrimonial/marriage/respond/${marriageRequestId}`, 'POST', tBride, { action: 'accept' });

    // 7. Verify Final State
    console.log('Verifying final state...');
    const finalGroom = await MatrimonialProfile.findOne({ userId: groom._id });
    const finalBride = await MatrimonialProfile.findOne({ userId: bride._id });

    if (finalGroom.status !== 'married' || !finalGroom.isClosed || finalGroom.maritalLifecycle !== 'married') {
      throw new Error('Groom profile not correctly closed/married');
    }
    if (finalBride.status !== 'married' || !finalBride.isClosed || finalBride.maritalLifecycle !== 'married') {
      throw new Error('Bride profile not correctly closed/married');
    }
    if (!finalGroom.marriageConfirmedWith.equals(finalBride.userId) || !finalBride.marriageConfirmedWith.equals(finalGroom.userId)) {
      throw new Error('marriageConfirmedWith not set correctly');
    }

    // Verify Chat is Archived
    const chat = await Conversation.findOne({ type: 'matrimonial', participants: { $all: [groom._id, bride._id] } });
    if (!chat || !chat.isArchived || !chat.isReadOnly) {
      throw new Error('Matrimonial chat was not archived and set to read-only');
    }

    console.log('✅ ALL API TESTS PASSED SUCCESSFULLY');

  } catch (err) {
    console.error('❌ TEST FAILED:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

runTest();
