/**
 * discover_users.js — Discovers real test credentials via live backend API.
 * Uses the backend health endpoint + tries common credential patterns.
 */
const http = require('http');

function req(method, path, body = null, token = null) {
  return new Promise((resolve) => {
    const opts = {
      hostname: 'localhost', port: 5001,
      path: '/api/v1' + path, method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve({ s: res.statusCode, b: JSON.parse(d) }); } catch { resolve({ s: res.statusCode, b: d }); } });
    });
    r.on('error', e => resolve({ s: 0, b: e.message }));
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function tryLogin(identifier, password, label) {
  const r = await req('POST', '/auth/login', { identifier, password });
  if (r.s === 200) {
    console.log(`✅ ${label}: phone=${identifier} pw=${password} | name=${r.b.user?.name} role=${r.b.user?.role} token=${r.b.token?.slice(0,20)}...`);
    return r.b.token;
  } else {
    console.log(`❌ ${label}: phone=${identifier} → ${r.s} ${r.b?.message || ''}`);
    return null;
  }
}

async function main() {
  // Check server alive (try auth route existence)
  const health = await req('GET', '/auth/login');
  console.log('Backend:', health.s < 500 ? '✅ Online' : `❌ ${health.s} – ${health.b}`);
  if (health.s === 0) { console.log('Server not running!'); process.exit(1); }

  console.log('\n— Trying known test credentials —');
  
  // Previous session used these — try them all
  const candidates = [
    // Nansi test accounts from setup_test_data.js
    { id: '9999111101', pw: 'Test@1234',  label: 'Member1' },
    { id: '9999111102', pw: 'Test@1234',  label: 'Member2' },
    { id: '9999111103', pw: 'Test@1234',  label: 'Member3' },
    { id: '9876543210', pw: 'Test@1234',  label: 'Member_A' },
    { id: '9999999999', pw: 'Admin@1234', label: 'Admin1' },
    { id: '7777777777', pw: 'Admin@1234', label: 'Admin2' },
    { id: '8888888888', pw: 'Head@1234',  label: 'Head1' },
    { id: '1234567890', pw: 'Test@1234',  label: 'Generic1' },
    // Admin/Head from force_reset_passwords
    { id: 'admin@merisamaj.com',       pw: 'Admin@123456', label: 'AdminEmail' },
    { id: 'head@merisamaj.com',        pw: 'Head@123456',  label: 'HeadEmail' },
    { id: 'samaj.admin@merisamaj.com', pw: 'Admin@123456', label: 'AdminEmail2' },
  ];
  
  for (const c of candidates) {
    await tryLogin(c.id, c.pw, c.label);
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
