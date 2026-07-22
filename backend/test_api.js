/**
 * MeriSamaj Community Chat & Group System — API Smoke Test
 * Run: node test_api.js
 *
 * Prerequisites:
 *   1. Backend running on http://localhost:5000
 *   2. At least 2 verified member accounts exist in DB
 *   3. Set USER1_EMAIL/PASSWORD and USER2_EMAIL/PASSWORD below
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BASE = 'http://localhost:5001/api/v1';

// Change these to real test credentials
const USER1 = { identifier: process.env.USER1_EMAIL || 'smoketest1@merisamaj.com', password: process.env.USER1_PASS || 'SmokeTest@123' };
const USER2 = { identifier: process.env.USER2_EMAIL || 'smoketest2@merisamaj.com', password: process.env.USER2_PASS || 'SmokeTest@123' };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let passed = 0, failed = 0, skipped = 0;
const results = [];

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': Buffer.byteLength(data) }),
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };
    const req = (url.protocol === 'https:' ? https : http).request(opts, res => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, data: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function test(name, fn) {
  process.stdout.write(`  ${name}... `);
  try {
    const result = await fn();
    if (result === 'SKIP') {
      console.log('⏭ SKIPPED');
      skipped++;
      results.push({ name, status: 'SKIP' });
    } else {
      console.log('✅ PASS');
      passed++;
      results.push({ name, status: 'PASS', data: result });
    }
    return result;
  } catch (err) {
    const msg = err.message || String(err);
    console.log(`❌ FAIL — ${msg}`);
    failed++;
    results.push({ name, status: 'FAIL', error: msg });
    return null;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

function assertStatus(res, expected, context = '') {
  assert(res, `No response ${context}`);
  assert(
    res.status === expected,
    `Expected HTTP ${expected}, got ${res.status}: ${JSON.stringify(res.data).substring(0, 200)} ${context}`
  );
}

// ─── TEST RUNNER ──────────────────────────────────────────────────────────────
async function run() {
  console.log('\n🧪 MeriSamaj Community Chat & Group API Smoke Test');
  console.log('='.repeat(60));

  // ── Section 1: Auth ───────────────────────────────────────────────────────
  console.log('\n📋 1. Authentication');

  let token1 = null, token2 = null, userId1 = null, userId2 = null;

  await test('Login User 1', async () => {
    const res = await request('POST', '/auth/login', USER1);
    assertStatus(res, 200, '(Login User 1)');
    token1 = res.data?.accessToken || res.data?.data?.token || res.data?.token;
    userId1 = res.data?.user?.id || res.data?.user?._id || res.data?.data?.user?._id;
    assert(token1, 'No token received for User 1');
    assert(userId1, 'No userId received for User 1');
    return { token: token1?.substring(0, 20) + '...', userId: userId1 };
  });

  await test('Login User 2', async () => {
    const res = await request('POST', '/auth/login', USER2);
    assertStatus(res, 200, '(Login User 2)');
    token2 = res.data?.accessToken || res.data?.data?.token || res.data?.token;
    userId2 = res.data?.user?.id || res.data?.user?._id || res.data?.data?.user?._id;
    assert(token2, 'No token received for User 2');
    assert(userId2, 'No userId received for User 2');
    return { userId: userId2 };
  });

  if (!token1) {
    console.log('\n⛔ Auth failed — cannot proceed. Check credentials.\n');
    printSummary();
    process.exit(1);
  }

  // ── Section 2: Groups ─────────────────────────────────────────────────────
  console.log('\n📋 2. Groups API');

  let groupId = null, convId = null;

  await test('GET /member/groups — list groups', async () => {
    const res = await request('GET', '/member/groups', null, token1);
    assertStatus(res, 200);
    const groups = res.data?.data?.groups;
    assert(Array.isArray(groups), 'groups is not an array');
    return { count: groups.length };
  });

  await test('POST /member/groups — create group', async () => {
    const res = await request('POST', '/member/groups', {
      name: `Test Group ${Date.now()}`,
      description: 'Automated smoke test group',
      type: 'public',
      category: 'General'
    }, token1);
    // 201 = instant creation, 202 = pending approval
    assert([201, 202].includes(res.status), `Expected 201 or 202, got ${res.status}: ${JSON.stringify(res.data)}`);
    groupId = res.data?.data?.group?._id;
    assert(groupId, 'No groupId in response');
    return { groupId, status: res.data?.data?.group?.approvalStatus };
  });

  await test('GET /member/groups/:id — group detail', async () => {
    if (!groupId) return 'SKIP';
    const res = await request('GET', `/member/groups/${groupId}`, null, token1);
    assertStatus(res, 200);
    const g = res.data?.data?.group;
    assert(g?.name, 'No group name in response');
    return { name: g.name, type: g.type };
  });

  await test('POST /member/groups/:id/join — User 2 joins group', async () => {
    if (!groupId || !token2) return 'SKIP';
    const res = await request('POST', `/member/groups/${groupId}/join`, null, token2);
    assert([200, 202].includes(res.status), `Expected 200 or 202, got ${res.status}: ${JSON.stringify(res.data)}`);
    return { status: res.data?.message };
  });

  await test('GET /member/groups/:id/members — list members', async () => {
    if (!groupId) return 'SKIP';
    const res = await request('GET', `/member/groups/${groupId}/members`, null, token1);
    assertStatus(res, 200);
    const members = res.data?.data?.members;
    assert(Array.isArray(members), 'members not array');
    return { memberCount: members.length };
  });

  await test('POST /member/groups/:id/leave — User 2 leaves', async () => {
    if (!groupId || !token2) return 'SKIP';
    const res = await request('POST', `/member/groups/${groupId}/leave`, null, token2);
    assertStatus(res, 200);
    return { message: res.data?.message };
  });

  // ── Section 3: Group Chat ─────────────────────────────────────────────────
  console.log('\n📋 3. Group Chat API');

  let groupMsgId = null, groupConvId = null;

  await test('GET /member/groups/:id/conversation — get group conversation', async () => {
    if (!groupId) return 'SKIP';
    const res = await request('GET', `/member/groups/${groupId}/conversation`, null, token1);
    assertStatus(res, 200);
    groupConvId = res.data?.data?.conversation?._id;
    assert(groupConvId, 'No conversationId in response');
    return { conversationId: groupConvId };
  });

  await test('POST /member/groups/conversations/:convId/messages — send message', async () => {
    if (!groupConvId) return 'SKIP';
    const res = await request('POST', `/member/groups/conversations/${groupConvId}/messages`, {
      message: 'Hello from smoke test 👋',
      type: 'text'
    }, token1);
    assertStatus(res, 201);
    groupMsgId = res.data?.data?.message?._id;
    assert(groupMsgId, 'No message ID in response');
    return { msgId: groupMsgId };
  });

  await test('GET /member/groups/conversations/:convId/messages — get messages', async () => {
    if (!groupConvId) return 'SKIP';
    const res = await request('GET', `/member/groups/conversations/${groupConvId}/messages?page=1&limit=20`, null, token1);
    assertStatus(res, 200);
    const msgs = res.data?.data?.messages;
    assert(Array.isArray(msgs), 'messages not array');
    return { count: msgs.length };
  });

  await test('PATCH /member/groups/messages/:msgId/pin — pin message', async () => {
    if (!groupMsgId) return 'SKIP';
    const res = await request('PATCH', `/member/groups/messages/${groupMsgId}/pin`, null, token1);
    assertStatus(res, 200);
    return { pinned: true };
  });

  await test('DELETE /member/groups/messages/:msgId — delete message', async () => {
    if (!groupMsgId) return 'SKIP';
    const res = await request('DELETE', `/member/groups/messages/${groupMsgId}?deleteFor=me`, null, token1);
    assertStatus(res, 200);
    return { ok: true };
  });

  // ── Section 4: Member Chat (1-to-1) ───────────────────────────────────────
  console.log('\n📋 4. Member Chat (1-to-1) API');

  let memberMsgId = null;

  await test('POST /member/chat/conversations — open conversation', async () => {
    if (!token1 || !userId2) return 'SKIP';
    const res = await request('POST', '/member/chat/conversations', { targetUserId: userId2 }, token1);
    assertStatus(res, 200);
    convId = res.data?.data?.conversation?._id;
    assert(convId, 'No conversationId');
    return { conversationId: convId };
  });

  await test('POST /member/chat/conversations/:id/messages — send message', async () => {
    if (!convId) return 'SKIP';
    const res = await request('POST', `/member/chat/conversations/${convId}/messages`, {
      message: 'Hello from smoke test',
      type: 'text'
    }, token1);
    assertStatus(res, 201);
    memberMsgId = res.data?.data?.message?._id;
    assert(memberMsgId, 'No message ID');
    return { msgId: memberMsgId };
  });

  await test('GET /member/chat/conversations — list conversations', async () => {
    const res = await request('GET', '/member/chat/conversations', null, token1);
    assertStatus(res, 200);
    const convs = res.data?.data?.conversations;
    assert(Array.isArray(convs), 'conversations not array');
    return { count: convs.length };
  });

  await test('GET /member/chat/conversations/:id/messages — get messages', async () => {
    if (!convId) return 'SKIP';
    const res = await request('GET', `/member/chat/conversations/${convId}/messages?page=1&limit=20`, null, token1);
    assertStatus(res, 200);
    const msgs = res.data?.data?.messages;
    assert(Array.isArray(msgs), 'messages not array');
    return { count: msgs.length };
  });

  await test('POST /member/chat/conversations/:id/seen — mark seen', async () => {
    if (!convId || !memberMsgId) return 'SKIP';
    const res = await request('POST', `/member/chat/conversations/${convId}/seen`, {
      messageIds: [memberMsgId]
    }, token2);
    assert([200, 204].includes(res.status), `Expected 200/204, got ${res.status}`);
    return { ok: true };
  });

  await test('DELETE /member/chat/messages/:msgId — delete for me', async () => {
    if (!memberMsgId) return 'SKIP';
    const res = await request('DELETE', `/member/chat/messages/${memberMsgId}?deleteFor=me`, null, token1);
    assertStatus(res, 200);
    return { ok: true };
  });

  // ── Section 5: Announcements ───────────────────────────────────────────────
  console.log('\n📋 5. Announcements API');

  let channelId = null, announcementId = null;

  await test('GET /member/announcements — list channels', async () => {
    const res = await request('GET', '/member/announcements', null, token1);
    assertStatus(res, 200);
    const channels = res.data?.data?.channels;
    assert(Array.isArray(channels), 'channels not array');
    channelId = channels[0]?._id;
    return { count: channels.length, firstChannel: channelId };
  });

  await test('POST /member/announcements/:channelId/messages — post announcement', async () => {
    if (!channelId) return 'SKIP';
    const res = await request('POST', `/member/announcements/${channelId}/messages`, {
      message: 'Test announcement from smoke test',
      type: 'text'
    }, token1);
    // 201 = success, 403 = no permission (user is not head/admin) — both are valid outcomes
    if (res.status === 403) {
      console.log('    ℹ Permission check correct — regular member cannot post announcements');
      return { permissionBlocked: true };
    }
    assertStatus(res, 201);
    announcementId = res.data?.data?.message?._id;
    return { announcementId };
  });

  await test('GET /member/announcements/:channelId/messages — get announcements', async () => {
    if (!channelId) return 'SKIP';
    const res = await request('GET', `/member/announcements/${channelId}/messages`, null, token1);
    assertStatus(res, 200);
    const msgs = res.data?.data?.messages;
    assert(Array.isArray(msgs), 'messages not array');
    return { count: msgs.length };
  });

  // ── Section 6: Authorization / Permission Tests ────────────────────────────
  console.log('\n📋 6. Authorization Checks');

  await test('UNAUTH: GET groups without token → 401', async () => {
    const res = await request('GET', '/member/groups', null, null);
    assert([401, 403].includes(res.status), `Expected 401/403, got ${res.status}`);
    return { statusCode: res.status };
  });

  await test('WRONG USER: User2 cannot delete User1 message for everyone', async () => {
    if (!convId || !token1 || !token2) return 'SKIP';
    const sendRes = await request('POST', `/member/chat/conversations/${convId}/messages`, {
      message: 'Message to try to delete by other user',
      type: 'text'
    }, token1);
    if (sendRes.status !== 201) return 'SKIP';
    const newMsgId = sendRes.data?.data?.message?._id;
    if (!newMsgId) return 'SKIP';
    const delRes = await request('DELETE', `/member/chat/messages/${newMsgId}?deleteFor=everyone`, null, token2);
    assert([403, 401].includes(delRes.status), `Expected 403, got ${delRes.status}`);
    return { statusCode: delRes.status };
  });

  await test('COMMUNITY ISOLATION: Non-member cannot send to group conversation', async () => {
    // User2 (who left the group) tries to send to the group conversation
    if (!groupConvId || !token2) return 'SKIP';
    const res = await request('POST', `/member/groups/conversations/${groupConvId}/messages`, {
      message: 'Unauthorized group message',
      type: 'text'
    }, token2);
    assert([403, 401].includes(res.status), `Expected 403 for non-member, got ${res.status}`);
    return { statusCode: res.status };
  });

  // ── Section 7: Cleanup ────────────────────────────────────────────────────
  console.log('\n📋 7. Cleanup');

  await test('DELETE /member/groups/:id — delete test group', async () => {
    if (!groupId) return 'SKIP';
    const res = await request('DELETE', `/member/groups/${groupId}`, null, token1);
    assert([200, 403].includes(res.status), `Expected 200 or 403, got ${res.status}: ${JSON.stringify(res.data)}`);
    return { status: res.status, message: res.data?.message };
  });

  printSummary();
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log(`📊 RESULTS: ${passed} passed · ${failed} failed · ${skipped} skipped`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   • ${r.name}: ${r.error}`);
    });
  }

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Core API is working.\n');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Review the errors above.\n`);
    process.exitCode = 1;
  }
}

run().catch(err => {
  console.error('\n💥 Unexpected error:', err.message);
  process.exitCode = 1;
});
