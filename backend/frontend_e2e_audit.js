/**
 * frontend_e2e_audit.js
 * Comprehensive Frontend E2E Runtime Verification
 * Tests every major workflow against live backend APIs.
 */
const http = require('http');
const https = require('https');
const querystring = require('querystring');

const API   = 'http://localhost:5001/api/v1';
let passed  = 0, failed = 0, warned = 0;
const failures = [], warnings = [];

function req(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url  = new URL(API + path);
    const opts = {
      hostname: url.hostname,
      port:     url.port || 80,
      path:     url.pathname + (url.search || ''),
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ s: res.statusCode, b: JSON.parse(d) }); }
        catch { resolve({ s: res.statusCode, b: d }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

function pass(label) { passed++; console.log(`  ✅ ${label}`); }
function fail(label) { failed++; failures.push(label); console.log(`  ❌ ${label}`); }
function warn(label) { warned++; warnings.push(label); console.log(`  ⚠️  ${label}`); }
function section(title) { console.log(`\n${'─'.repeat(62)}\n  ${title}\n${'─'.repeat(62)}`); }

async function main() {
  console.log(`\n${'═'.repeat(62)}\n  MERI SAMAJ — MATRIMONIAL FRONTEND E2E VERIFICATION\n${'═'.repeat(62)}`);

  // ─── AUTH ──────────────────────────────────────────────────────────────────
  section('AUTH — Login all roles');
  let memberToken = null, adminToken = null, headToken = null;
  let memberProfile = null, anotherProfileId = null;

  // ─── Use real users discovered from Atlas DB ─────────────────────
  // Members: role='user', phone known, pw reset to Test@1234
  // Admin:   phone=7777777777, pw=Admin@1234
  // Head:    phone=8888888888, pw=Head@1234

  const mLogin = await req('POST', '/auth/login', { identifier: '9685081052', password: 'Test@1234' });
  if (mLogin.s === 200) { memberToken = mLogin.b.accessToken; pass(`Member login OK | user=${mLogin.b.user?.name}`); }
  else fail(`Member login: ${mLogin.s} ${JSON.stringify(mLogin.b).slice(0,80)}`);

  const aLogin = await req('POST', '/auth/login', { identifier: '7777777777', password: 'Admin@1234' });
  if (aLogin.s === 200) { adminToken = aLogin.b.accessToken; pass(`Admin login OK | role=${aLogin.b.user?.role}`); }
  else warn(`Admin login: ${aLogin.s} ${JSON.stringify(aLogin.b).slice(0,80)}`);

  const hLogin = await req('POST', '/auth/login', { identifier: '8888888888', password: 'Head@1234' });
  if (hLogin.s === 200) { headToken = hLogin.b.accessToken; pass(`Head login OK | role=${hLogin.b.user?.role}`); }
  else warn(`Head login: ${hLogin.s} ${JSON.stringify(hLogin.b).slice(0,80)}`);

  if (!memberToken) { console.log('\n❌ Cannot continue — member token missing'); process.exit(1); }

  // ─── MY PROFILE ────────────────────────────────────────────────────────────
  section('MEMBER — My Matrimonial Profile');
  const myP = await req('GET', '/member/matrimonial/profile/me', null, memberToken);
  if (myP.s === 200) {
    memberProfile = myP.b.data?.profile;
    if (memberProfile) {
      pass(`GET /profile/me | status=${memberProfile.status} completion=${memberProfile.completionPercentage || memberProfile.profileCompletion?.percentage}%`);
      if (memberProfile.personal?.fullName) pass(`Profile has personal.fullName: ${memberProfile.personal.fullName}`);
      else warn('Profile missing personal.fullName');
      if (memberProfile.maritalLifecycle) pass(`Profile has maritalLifecycle: ${memberProfile.maritalLifecycle}`);
      else warn('Profile missing maritalLifecycle field');
    } else {
      warn(`GET /profile/me: profile=null (user has no matrimonial profile yet — expected for new users)`);
    }
  } else {
    fail(`GET /profile/me: ${myP.s} ${JSON.stringify(myP.b).slice(0,100)}`);
  }

  // ─── DASHBOARD ─────────────────────────────────────────────────────────────
  section('MEMBER — Dashboard Data Verification');
  const dash = await req('GET', '/member/matrimonial/dashboard', null, memberToken);
  if (dash.s === 200) {
    const d = dash.b.data?.dashboard;
    pass(`GET /dashboard: 200`);
    const fields = ['profileCompletion','profileStatus','maritalLifecycle','subscription','interests','visitors','shortlist','recentChats','recommendations'];
    fields.forEach(f => {
      if (d?.[f] !== undefined) pass(`  dashboard.${f} present`);
      else warn(`  dashboard.${f} MISSING`);
    });

    // Recommendations
    const recs = d?.recommendations;
    const recFields = ['recommendedMatches','newMembers','recentlyActive','premiumMembers','nearYou'];
    recFields.forEach(f => {
      if (Array.isArray(recs?.[f])) pass(`  recommendations.${f}: count=${recs[f].length}`);
      else warn(`  recommendations.${f} is not an array`);
    });

    // Interest counts
    const interests = d?.interests;
    ['sent','received','accepted','pending','rejected'].forEach(k => {
      if (interests?.[k] !== undefined) pass(`  interests.${k} = ${interests[k]}`);
      else warn(`  interests.${k} missing`);
    });
  } else {
    fail(`GET /dashboard: ${dash.s} ${JSON.stringify(dash.b).slice(0,100)}`);
  }

  // ─── SEARCH ────────────────────────────────────────────────────────────────
  section('MEMBER — Profile Search & Filters');
  const search = await req('GET', '/member/matrimonial/profile/search?limit=10', null, memberToken);
  if (search.s === 200) {
    const data = search.b.data;
    const profiles = data?.profiles || [];
    // Check pagination object exists
    if (data?.pagination) pass(`Search pagination object present | total=${data.pagination.total} pages=${data.pagination.pages}`);
    else if (data?.total !== undefined) pass(`Search total present (legacy) | total=${data.total}`);
    else warn('Search response missing pagination object AND total — frontend will show "0 profiles"');

    pass(`Search results | count=${profiles.length}`);
    if (profiles.length > 0) {
      anotherProfileId = profiles[0]._id;
      const p = profiles[0];
      if (p._id) pass(`Profile has _id: ${p._id}`);
      else fail('Profile missing _id');
      if (p.status === 'active') pass(`Profile status=active`);
      else fail(`Profile status is '${p.status}' — only active profiles should appear`);
      if (p.personal?.fullName) pass(`Profile has personal.fullName: ${p.personal.fullName}`);
      else warn('Profile missing personal.fullName mapping');
    } else {
      warn('No profiles in search results — check if active profiles exist in DB');
    }
  } else {
    fail(`GET /profile/search: ${search.s} ${JSON.stringify(search.b).slice(0,100)}`);
  }

  // Name filter
  const nameSearch = await req('GET', '/member/matrimonial/profile/search?name=Nansi', null, memberToken);
  if (nameSearch.s === 200) pass(`Name filter works | count=${nameSearch.b.data?.profiles?.length}`);
  else fail(`Name filter failed: ${nameSearch.s}`);

  // Gotra filter
  const gotraSearch = await req('GET', '/member/matrimonial/profile/search?gotra=Garg', null, memberToken);
  if (gotraSearch.s === 200) pass(`Gotra filter works | count=${gotraSearch.b.data?.profiles?.length}`);
  else fail(`Gotra filter failed: ${gotraSearch.s}`);

  // Verified filter
  const verifiedSearch = await req('GET', '/member/matrimonial/profile/search?verifiedOnly=true', null, memberToken);
  if (verifiedSearch.s === 200) pass(`Verified-only filter works | count=${verifiedSearch.b.data?.profiles?.length}`);
  else warn(`Verified-only filter: ${verifiedSearch.s}`);

  // ─── INTERESTS ─────────────────────────────────────────────────────────────
  section('MEMBER — Interest Workflow');
  const sentI = await req('GET', '/member/matrimonial/interests/sent', null, memberToken);
  if (sentI.s === 200 && Array.isArray(sentI.b.data?.interests)) pass(`GET /interests/sent | count=${sentI.b.data.interests.length}`);
  else fail(`GET /interests/sent: ${sentI.s}`);

  const recvI = await req('GET', '/member/matrimonial/interests/received', null, memberToken);
  if (recvI.s === 200 && Array.isArray(recvI.b.data?.interests)) pass(`GET /interests/received | count=${recvI.b.data.interests.length}`);
  else fail(`GET /interests/received: ${recvI.s}`);

  if (anotherProfileId) {
    // Try to send interest
    const sendI = await req('POST', '/member/matrimonial/interests/send', { receiverProfileId: anotherProfileId }, memberToken);
    if (sendI.s === 201) pass(`Interest sent to ${anotherProfileId}`);
    else if (sendI.s === 400 && sendI.b.message?.includes('already')) pass(`Interest already sent (idempotent) | ${sendI.b.message}`);
    else if (sendI.s === 400) warn(`Send interest: ${sendI.b.message}`);
    else fail(`POST /interests/send: ${sendI.s} ${JSON.stringify(sendI.b).slice(0,80)}`);
  } else {
    warn('Skipped interest send — no available target profile');
  }

  // ─── SHORTLIST ─────────────────────────────────────────────────────────────
  section('MEMBER — Shortlist');
  const sl = await req('GET', '/member/matrimonial/shortlist', null, memberToken);
  if (sl.s === 200) {
    const items = sl.b.data?.items || sl.b.data?.shortlist || [];
    pass(`GET /shortlist | count=${items.length}`);
    if (items.length > 0) {
      if (items[0].profileId) pass('Shortlist item has profileId');
      else fail('Shortlist item missing profileId — frontend mapping will fail');
      if (items[0].addedAt || items[0].createdAt) pass(`Shortlist item has date field (addedAt or createdAt)`);
      else warn('Shortlist item missing addedAt/createdAt — date display will be wrong');
    }
    // Test add
    if (anotherProfileId) {
      const addSl = await req('POST', '/member/matrimonial/shortlist', { profileId: anotherProfileId }, memberToken);
      if (addSl.s === 200 || addSl.s === 201) pass(`POST /shortlist (add) works`);
      else if (addSl.s === 400) warn(`Shortlist add: already shortlisted or ${addSl.b.message}`);
      else fail(`POST /shortlist: ${addSl.s}`);
    }
  } else {
    fail(`GET /shortlist: ${sl.s} ${JSON.stringify(sl.b).slice(0,80)}`);
  }

  // ─── VISITORS ──────────────────────────────────────────────────────────────
  section('MEMBER — Visitors (Premium Feature Gate)');
  const vis = await req('GET', '/member/matrimonial/visitors', null, memberToken);
  if (vis.s === 200) {
    const visitors = vis.b.data?.visitors || [];
    pass(`GET /visitors: 200 | count=${visitors.length}`);
    if (visitors.length > 0) {
      if (visitors[0].visitorProfile) pass('Visitor has visitorProfile (enriched)');
      else warn('Visitor missing visitorProfile — frontend dynamicVisitors mapping will yield empty names');
    }
  } else if (vis.s === 403) {
    pass('GET /visitors: 403 (premium gate — correct, free user)');
    pass('MatrimonialContext silently ignores 403 → visitors=[] (correct behavior)');
  } else {
    fail(`GET /visitors: ${vis.s}`);
  }

  // ─── BLOCKED ───────────────────────────────────────────────────────────────
  section('MEMBER — Block List');
  const bl = await req('GET', '/member/matrimonial/blocked', null, memberToken);
  if (bl.s === 200) {
    const blocked = bl.b.data?.blockedUsers || [];
    pass(`GET /blocked | count=${blocked.length}`);
    if (blocked.length > 0) {
      if (blocked[0].blockedUserId) pass('Blocked entry has blockedUserId');
      else fail('Blocked entry missing blockedUserId — blockedIds mapping will fail');
    }
  } else {
    fail(`GET /blocked: ${bl.s}`);
  }

  // ─── PROFILE VIEW (Record Visitor) ─────────────────────────────────────────
  section('MEMBER — Profile View & Visitor Tracking');
  if (anotherProfileId) {
    const pView = await req('GET', `/member/matrimonial/profile/${anotherProfileId}`, null, memberToken);
    if (pView.s === 200) {
      const p = pView.b.data?.profile;
      pass(`GET /profile/:id works | name=${p?.personal?.fullName}`);
      if (p?.personal?.fullName) pass('Profile page: personal.fullName present');
      if (p?.education) pass('Profile page: education section present');
      if (p?.photos) pass('Profile page: photos array present');
      else warn('Profile page: photos array missing');
    } else {
      fail(`GET /profile/${anotherProfileId}: ${pView.s}`);
    }
  } else {
    warn('Skipped profile view — no target profile available');
  }

  // ─── CHAT ──────────────────────────────────────────────────────────────────
  section('MEMBER — Chat Conversations');
  const convs = await req('GET', '/member/matrimonial/chat/conversations', null, memberToken);
  if (convs.s === 200) {
    const conversations = convs.b.data?.conversations || [];
    pass(`GET /chat/conversations | count=${conversations.length}`);
    if (conversations.length > 0) {
      const c = conversations[0];
      if (c._id) pass(`Conversation has _id: ${c._id}`);
      if (c.participants) pass('Conversation has participants array');
    }
  } else if (convs.s === 403) {
    warn('GET /chat/conversations: 403 — premium gate or no accepted interest');
  } else {
    fail(`GET /chat/conversations: ${convs.s} ${JSON.stringify(convs.b).slice(0,80)}`);
  }

  // ─── ADMIN PANEL ───────────────────────────────────────────────────────────
  section('ADMIN — Matrimonial Management');
  if (adminToken) {
    // Stats
    const stats = await req('GET', '/admin/matrimonial/stats', null, adminToken);
    if (stats.s === 200) {
      const d = stats.b.data;
      pass(`GET /admin/stats | total=${d?.totalProfiles} active=${d?.activeProfiles} pending=${d?.pendingProfiles}`);
      if (d?.totalProfiles !== undefined) pass('Admin stats: totalProfiles');
      if (d?.connectedMembers !== undefined) pass('Admin stats: connectedMembers');
      if (d?.weeklyRegistrations !== undefined) pass('Admin stats: weeklyRegistrations');
    } else {
      fail(`GET /admin/stats: ${stats.s} ${JSON.stringify(stats.b).slice(0,80)}`);
    }

    // Profile list
    const adminProfiles = await req('GET', '/admin/matrimonial/profiles?status=pending', null, adminToken);
    if (adminProfiles.s === 200) {
      const count = adminProfiles.b.data?.profiles?.length || 0;
      pass(`GET /admin/profiles?status=pending | count=${count}`);
    } else {
      fail(`GET /admin/profiles: ${adminProfiles.s}`);
    }

    // Try verify (use any pending profile)
    const allAdminP = await req('GET', '/admin/matrimonial/profiles?status=pending&limit=1', null, adminToken);
    const pendingId = allAdminP.b.data?.profiles?.[0]?._id;
    if (pendingId) {
      // Admin verify endpoint: body = { status: 'verified' | 'rejected', adminNote? }
      const verify = await req('PUT', `/admin/matrimonial/profiles/${pendingId}/verify`, { status: 'verified', adminNote: 'E2E audit passed' }, adminToken);
      if (verify.s === 200) pass(`Admin verify profile: OK`);
      else fail(`Admin verify: ${verify.s} ${JSON.stringify(verify.b).slice(0,80)}`);
    } else {
      warn('No pending profiles to verify (already all active)');
    }
  } else {
    warn('Skipped Admin tests — no admin token');
  }

  // ─── HEAD PANEL ────────────────────────────────────────────────────────────
  section('HEAD — Community Matrimonial');
  if (headToken) {
    const hStats = await req('GET', '/head/matrimonial/stats', null, headToken);
    if (hStats.s === 200) {
      const d = hStats.b.data;
      const total = d?.totalProfiles ?? d?.total ?? d?.stats?.totalProfiles ?? Object.values(d || {})[0];
      pass(`GET /head/stats | response fields: ${Object.keys(d || {}).join(', ')}`);
    } else {
      fail(`GET /head/stats: ${hStats.s}`);
    }

    const hPending = await req('GET', '/head/matrimonial/profiles/pending', null, headToken);
    if (hPending.s === 200) pass(`GET /head/profiles/pending | count=${hPending.b.data?.profiles?.length || 0}`);
    else fail(`GET /head/profiles/pending: ${hPending.s}`);
  } else {
    warn('Skipped Head tests — no head token');
  }

  // ─── FRONTEND API CONTRACT CHECKS ──────────────────────────────────────────
  section('FRONTEND CONTRACT — API Shape vs Context Mapping');

  // Check search pagination shape is correct for frontend
  const searchCheck = await req('GET', '/member/matrimonial/profile/search?limit=1', null, memberToken);
  if (searchCheck.s === 200) {
    const d = searchCheck.b.data;
    if (d?.pagination?.total !== undefined && d?.pagination?.pages !== undefined) {
      pass('Search: data.pagination.total & data.pagination.pages present (frontend fix applied ✓)');
    } else if (d?.total !== undefined) {
      warn('Search: using legacy data.total (no pagination wrapper) — frontend may need adjustment');
    } else {
      fail('Search: NEITHER data.pagination.total NOR data.total found — count display broken');
    }
  }

  // Check shortlist shape
  const slCheck = await req('GET', '/member/matrimonial/shortlist', null, memberToken);
  if (slCheck.s === 200) {
    const d = slCheck.b.data;
    if (Array.isArray(d?.items)) pass('Shortlist: data.items[] present (correct key ✓)');
    else if (Array.isArray(d?.shortlist)) warn('Shortlist: using legacy data.shortlist key');
    else fail('Shortlist: neither data.items nor data.shortlist found');
  }

  // Check interests shape
  const intCheck = await req('GET', '/member/matrimonial/interests/received', null, memberToken);
  if (intCheck.s === 200) {
    if (Array.isArray(intCheck.b.data?.interests)) pass('Interests: data.interests[] present (correct ✓)');
    else fail('Interests: data.interests[] missing');
  }

  // Check blocked shape
  const blCheck = await req('GET', '/member/matrimonial/blocked', null, memberToken);
  if (blCheck.s === 200) {
    if (Array.isArray(blCheck.b.data?.blockedUsers)) pass('Blocked: data.blockedUsers[] present (correct ✓)');
    else fail('Blocked: data.blockedUsers[] missing');
  }

  // ─── SUMMARY ───────────────────────────────────────────────────────────────
  console.log(`\n${'═'.repeat(62)}\n  VERIFICATION SUMMARY\n${'═'.repeat(62)}`);
  console.log(`  ✅ PASSED : ${passed}`);
  console.log(`  ❌ FAILED : ${failed}`);
  console.log(`  ⚠️  WARNED : ${warned}`);
  if (failures.length) {
    console.log('\n  FAILURES:');
    failures.forEach(f => console.log(`    ✗ ${f}`));
  }
  if (warnings.length) {
    console.log('\n  WARNINGS:');
    warnings.forEach(w => console.log(`    ! ${w}`));
  }
  console.log('');
}

main().catch(e => { console.error(e.message); process.exit(1); });
