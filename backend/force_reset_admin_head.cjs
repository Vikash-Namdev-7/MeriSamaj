/**
 * force_reset_admin_head.cjs
 * Uses raw MongoDB driver (bypasses Mongoose pre-save hooks) to reset admin/head passwords.
 * bcryptjs hash generated directly here.
 */
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function main() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);
  await client.connect();
  
  const db = client.db('test'); // Atlas DB is named 'test'
  const users = db.collection('users');
  
  const accounts = [
    { phone: '7777777777', password: 'Admin@1234', role: 'admin' },
    { phone: '8888888888', password: 'Head@1234',  role: 'head' },
    { phone: '2222222222', password: 'Head@1234',  role: 'head' },
  ];
  
  for (const acc of accounts) {
    const hashed = await bcrypt.hash(acc.password, 10);
    const result = await users.updateOne(
      { phone: acc.phone },
      { $set: { password: hashed, accountStatus: 'active' } }
    );
    console.log(`${acc.role} ${acc.phone}: matched=${result.matchedCount} modified=${result.modifiedCount}`);
    
    // Verify the hash works
    const doc = await users.findOne({ phone: acc.phone });
    const valid = doc ? await bcrypt.compare(acc.password, doc.password) : false;
    console.log(`  ✅ Hash valid: ${valid} | storedHash starts: ${doc?.password?.slice(0,7)}`);
  }
  
  await client.close();
  console.log('\nDone! Admin/head passwords reset via raw driver (no double-hash).');
}

main().catch(e => { console.error(e.message); process.exit(1); });
