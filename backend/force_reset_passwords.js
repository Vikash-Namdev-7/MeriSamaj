/**
 * force_reset_passwords.js
 * Uses raw MongoDB driver to bypass ALL Mongoose hooks.
 * Sets admin and head passwords directly in the collection.
 */
require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function main() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  console.log('Connected via raw MongoClient (no mongoose)');

  const db = client.db();
  const users = db.collection('users');

  const adminPw = await bcrypt.hash('Admin@1234', 10);
  const headPw  = await bcrypt.hash('Head@1234', 10);

  // Set passwords
  const a = await users.updateOne({ phone: '7777777777' }, { $set: { password: adminPw } });
  const h = await users.updateOne({ phone: '8888888888' }, { $set: { password: headPw  } });
  console.log('Admin update:', a.modifiedCount, 'docs | Head update:', h.modifiedCount, 'docs');

  // Verify immediately
  const adminDoc = await users.findOne({ phone: '7777777777' });
  const headDoc  = await users.findOne({ phone: '8888888888' });

  const adminOk = await bcrypt.compare('Admin@1234', adminDoc.password);
  const headOk  = await bcrypt.compare('Head@1234',  headDoc.password);

  console.log('Admin@1234 verify:', adminOk);
  console.log('Head@1234 verify:',  headOk);
  console.log('Admin hash:', adminDoc.password.substring(0, 25), '...');

  await client.close();
  console.log('Done. Test login at: POST /api/v1/auth/login { identifier:"7777777777", password:"Admin@1234" }');
}

main().catch(e => { console.error(e.message); process.exit(1); });
