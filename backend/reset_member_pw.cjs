/**
 * reset_member_pw.cjs - Resets first 3 member passwords for E2E testing
 * Uses raw MongoClient to bypass Mongoose pre-save double-hash
 */
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function main() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const users = client.db('test').collection('users');
  const hashed = await bcrypt.hash('Test@1234', 10);
  
  const members = ['9685081052', '9876543210', '9822000010', '9755000088', '9876543234'];
  for (const phone of members) {
    const r = await users.updateOne({ phone }, { $set: { password: hashed, accountStatus: 'active' } });
    const doc = await users.findOne({ phone });
    const valid = doc ? await bcrypt.compare('Test@1234', doc.password) : false;
    console.log(`Reset ${phone}: matched=${r.matchedCount} hashValid=${valid}`);
  }
  
  await client.close();
  console.log('Done!');
}
main().catch(e => { console.error(e.message); process.exit(1); });
