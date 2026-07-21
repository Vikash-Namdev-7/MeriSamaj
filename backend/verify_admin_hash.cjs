/**
 * verify_admin_hash.cjs - Directly tests admin hash verification
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
  
  // Check admin user in Atlas
  const admin = await users.findOne({ phone: '7777777777' });
  console.log('Admin found:', !!admin);
  if (admin) {
    console.log('Name:', admin.name);
    console.log('Role:', admin.role);
    console.log('Status:', admin.accountStatus);
    console.log('Password hash (first 30):', admin.password?.slice(0,30));
    
    // Test password match
    const match1 = admin.password ? await bcrypt.compare('Admin@1234', admin.password) : false;
    const match2 = admin.password ? await bcrypt.compare('Admin@123456', admin.password) : false;
    console.log('Match Admin@1234:', match1);
    console.log('Match Admin@123456:', match2);
    
    // Reset it right now with a fresh hash
    const fresh = await bcrypt.hash('Admin@1234', 10);
    const verify = await bcrypt.compare('Admin@1234', fresh);
    console.log('Fresh hash verify:', verify);
    
    // Update in DB
    await users.updateOne({ phone: '7777777777' }, { $set: { password: fresh } });
    console.log('Hash updated in DB.');
    
    // Re-read and verify
    const updated = await users.findOne({ phone: '7777777777' });
    const afterMatch = await bcrypt.compare('Admin@1234', updated.password);
    console.log('After update match:', afterMatch);
    console.log('Updated hash (first 30):', updated.password?.slice(0,30));
  }
  
  await client.close();
}
main().catch(e => { console.error(e.message); process.exit(1); });
