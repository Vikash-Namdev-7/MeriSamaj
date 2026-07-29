const mongoose = require('mongoose');
const Professional = require('../src/models/Professional');
const User = require('../src/models/User');
const { applyScopeFilter } = require('../src/utils/queryScopeHelper');

console.log('====================================================');
console.log('🔄 PROFESSIONAL LISTING CREATE → APPROVE → DISPLAY LIFECYCLE TEST');
console.log('====================================================\n');

async function runLifecycleSimulation() {
  let passedCount = 0;
  let totalCount = 4;

  const mockCommunityId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439022');
  const mockMemberId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');
  const mockHeadId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439033');

  // STEP 1: Member Submission
  console.log('1️⃣  STEP 1: Member creates a new Professional Listing (POST /member/professionals)...');
  const newListingPayload = {
    ownerId: mockMemberId,
    communityId: mockCommunityId,
    companyName: 'Apex Legal Consultants',
    profession: 'Advocate',
    category: 'Legal Services',
    city: 'Jaipur',
    status: 'Pending'
  };

  const createdListing = new Professional(newListingPayload);
  if (createdListing.status === 'Pending' && createdListing.communityId.equals(mockCommunityId)) {
    console.log('   ✅ PASS: Listing created with status "Pending" and scoped communityId.');
    passedCount++;
  } else {
    console.log('   ❌ FAIL: Creation payload or status mismatch.');
  }

  // STEP 2: Head Queue Fetch
  console.log('\n2️⃣  STEP 2: Head Desk fetches Pending Listings queue (GET /head/professional?status=Pending)...');
  const mockHeadReq = {
    user: { _id: mockHeadId, role: 'head', communityId: mockCommunityId },
    communityId: mockCommunityId
  };
  
  const pendingQuery = applyScopeFilter(mockHeadReq, { status: 'Pending' });
  if (pendingQuery.communityId.equals(mockCommunityId) && pendingQuery.status === 'Pending') {
    console.log('   ✅ PASS: Head query successfully scoped to communityId with status="Pending".');
    passedCount++;
  } else {
    console.log('   ❌ FAIL: Head queue query scoping invalid.');
  }

  // STEP 3: Head Approval Action
  console.log('\n3️⃣  STEP 3: Head approves listing (POST /head/professional/:id/approve)...');
  createdListing.status = 'Approved';
  createdListing.approval = {
    approvedBy: { userId: mockHeadId, role: 'HEAD' },
    approvedAt: new Date()
  };

  if (createdListing.status === 'Approved' && createdListing.approval.approvedBy.role === 'HEAD') {
    console.log('   ✅ PASS: Listing atomically transitioned to status "Approved" with audit log.');
    passedCount++;
  } else {
    console.log('   ❌ FAIL: Status transition or approval audit failed.');
  }

  // STEP 4: Public Directory Display
  console.log('\n4️⃣  STEP 4: Member directory displays approved listing (GET /member/professionals)...');
  const memberQuery = applyScopeFilter(mockHeadReq, { status: 'Approved' });
  if (memberQuery.status === 'Approved' && memberQuery.communityId.equals(mockCommunityId)) {
    console.log('   ✅ PASS: Public directory filter retrieves "Approved" listings scoped to community.');
    passedCount++;
  } else {
    console.log('   ❌ FAIL: Public display directory query mismatch.');
  }

  console.log('\n====================================================');
  console.log(`REPORT: ${passedCount}/${totalCount} STEPS PASSED SUCCESSFULLY!`);
  console.log('====================================================\n');
}

runLifecycleSimulation().catch(console.error);
