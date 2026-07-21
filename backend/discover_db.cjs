/**
 * discover_db.cjs - Finds the correct Atlas database name
 */
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGO_URI;
  console.log('URI:', uri.replace(/:[^@]+@/, ':***@'));
  
  const client = new MongoClient(uri);
  await client.connect();
  console.log('Connected!');
  
  // List all databases
  const admin = client.db('admin');
  const dbs = await admin.admin().listDatabases();
  console.log('\nDatabases:');
  dbs.databases.forEach(d => console.log(' ', d.name, d.sizeOnDisk + ' bytes'));
  
  // Try each DB to find users collection with admin phone
  for (const db of dbs.databases) {
    if (db.name === 'admin' || db.name === 'local') continue;
    const collection = client.db(db.name).collection('users');
    const count = await collection.countDocuments({});
    console.log(`\nDB: ${db.name} | users count: ${count}`);
    const u = await collection.findOne({ phone: '7777777777' });
    if (u) console.log(`  ✅ Found admin user: name=${u.name} role=${u.role}`);
    else {
      const sample = await collection.findOne({});
      if (sample) console.log(`  Sample user: name=${sample.name} phone=${sample.phone} role=${sample.role}`);
    }
  }
  
  await client.close();
}
main().catch(e => { console.error(e.message); process.exit(1); });
