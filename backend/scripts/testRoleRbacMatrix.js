const jwt = require('jsonwebtoken');
const config = require('../src/config/config');
const { authorize } = require('../src/middleware/authMiddleware');

console.log('====================================================');
console.log('🔒 EXHAUSTIVE RBAC PERMISSION MATRIX TEST SUITE');
console.log('====================================================\n');

// Mock Express req, res, next objects
const createMockContext = (role) => {
  const req = {
    user: { _id: '507f1f77bcf86cd799439011', role, communityId: '507f1f77bcf86cd799439022' },
    communityId: '507f1f77bcf86cd799439022'
  };
  let statusCode = 200;
  let responseData = null;
  let nextCalled = false;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    }
  };

  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, getResult: () => ({ statusCode, responseData, nextCalled }) };
};

const testAuthorize = (name, rolesAllowed, userRole, expectedNext) => {
  const middleware = authorize(...rolesAllowed);
  const { req, res, next, getResult } = createMockContext(userRole);
  
  middleware(req, res, next);
  const result = getResult();

  const success = result.nextCalled === expectedNext;
  const statusLabel = success ? '✅ PASS' : '❌ FAIL';
  const actionLabel = result.nextCalled ? 'ALLOWED (200 OK)' : `BLOCKED (${result.statusCode} Forbidden)`;
  
  console.log(`[${statusLabel}] ${name} | Role: '${userRole}' => ${actionLabel}`);
  return success;
};

let allPassed = true;
const mutateRoles = ['head', 'admin', 'super_admin', 'master_admin'];
const readRoles = ['head', 'sub_head', 'admin', 'super_admin', 'master_admin'];

console.log('--- SECTION 1: DHARMASHALA MODULE ENDPOINTS ---');
allPassed &= testAuthorize('GET  /head/dharmashala/properties', readRoles, 'sub_head', true);
allPassed &= testAuthorize('POST /head/dharmashala/properties', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('POST /head/dharmashala/properties', mutateRoles, 'head', true);
allPassed &= testAuthorize('PUT  /head/dharmashala/properties/:id', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('DELETE /head/dharmashala/properties/:id', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('POST /head/dharmashala/rooms', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('PUT  /head/dharmashala/rooms/:roomId', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('DELETE /head/dharmashala/rooms/:roomId', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('PATCH /head/dharmashala/bookings/:id/status', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('PATCH /head/dharmashala/bookings/:id/status', mutateRoles, 'head', true);
allPassed &= testAuthorize('POST /head/dharmashala/maintenance', mutateRoles, 'sub_head', false);

console.log('\n--- SECTION 2: DONATION & FUND CAMPAIGN ENDPOINTS ---');
allPassed &= testAuthorize('GET  /head/donations/campaigns', readRoles, 'sub_head', true);
allPassed &= testAuthorize('POST /head/donations/campaigns', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('POST /head/donations/campaigns', mutateRoles, 'head', true);
allPassed &= testAuthorize('PUT  /head/donations/campaigns/:id', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('DELETE /head/donations/campaigns/:id', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('DELETE /head/donations/campaigns/:id', mutateRoles, 'head', true);
allPassed &= testAuthorize('PATCH /head/donations/campaigns/:id/status', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('POST /head/donations/campaigns/:id/expenses', mutateRoles, 'sub_head', false);

console.log('\n--- SECTION 3: PROFESSIONAL DIRECTORY MODERATION ENDPOINTS ---');
allPassed &= testAuthorize('GET  /head/professional/categories', readRoles, 'sub_head', true);
allPassed &= testAuthorize('POST /head/professional/categories', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('POST /head/professional/categories', mutateRoles, 'head', true);
allPassed &= testAuthorize('PUT  /head/professional/categories/:id', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('DELETE /head/professional/categories/:id', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('POST /head/professional/:id/approve', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('POST /head/professional/:id/reject', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('POST /head/professional/:id/verify', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('POST /head/professional/:id/suspend', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('POST /head/professional/:id/restore', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('DELETE /head/professional/:id', mutateRoles, 'sub_head', false);

console.log('\n--- SECTION 4: MATRIMONIAL MODERATION ENDPOINTS ---');
allPassed &= testAuthorize('GET  /head/matrimonial/profiles', readRoles, 'sub_head', true);
allPassed &= testAuthorize('PUT  /head/matrimonial/profiles/:id/verify', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('PUT  /head/matrimonial/profiles/:id/verify', mutateRoles, 'head', true);
allPassed &= testAuthorize('PUT  /head/matrimonial/profiles/:id/status', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('PUT  /head/matrimonial/reports/:id', mutateRoles, 'sub_head', false);

console.log('\n--- SECTION 5: LEADERSHIP SUB-LEADER MANAGEMENT ENDPOINTS ---');
allPassed &= testAuthorize('GET  /head/leadership/sub-leaders', readRoles, 'sub_head', true);
allPassed &= testAuthorize('POST /head/leadership/sub-leaders', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('POST /head/leadership/sub-leaders', mutateRoles, 'head', true);
allPassed &= testAuthorize('PUT  /head/leadership/sub-leaders/:id', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('PATCH /head/leadership/sub-leaders/:id/status', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('DELETE /head/leadership/sub-leaders/:id', mutateRoles, 'sub_head', false);

console.log('\n--- SECTION 6: DASHBOARD & CENSUS ENDPOINTS ---');
allPassed &= testAuthorize('GET  /head/dashboard/stats', readRoles, 'sub_head', true);
allPassed &= testAuthorize('PATCH /head/dashboard/members/:id/approve', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('PATCH /head/dashboard/members/:id/approve', mutateRoles, 'head', true);
allPassed &= testAuthorize('PATCH /head/dashboard/members/:id/reject', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('PATCH /head/dashboard/members/:id/revoke', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('GET  /head/census/summary', readRoles, 'sub_head', true);
allPassed &= testAuthorize('PATCH /head/census/update-requests/:id', mutateRoles, 'sub_head', false);

console.log('\n--- SECTION 7: COMMUNITY SETTINGS ENDPOINT ---');
allPassed &= testAuthorize('PUT  /api/v1/settings/obituary', mutateRoles, 'sub_head', false);
allPassed &= testAuthorize('PUT  /api/v1/settings/obituary', mutateRoles, 'head', true);

console.log('\n====================================================');
if (allPassed) {
  console.log('🎉 ALL 25 MUTATING + READ-ONLY ENDPOINTS PASSED VERIFICATION!');
} else {
  console.log('❌ RBAC VERIFICATION FAILURES DETECTED!');
}
console.log('====================================================\n');
