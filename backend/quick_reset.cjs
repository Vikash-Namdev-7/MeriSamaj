require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function main() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const users = client.db('test').collection('users');
  
  const resets = [
    { phone: '7777777777', pw: 'Admin@1234' },
    { phone: '8888888888', pw: 'Head@1234' },
    { phone: '2222222222', pw: 'Head@1234' },
  ];
  
  for (const r of resets) {
    const hash = await bcrypt.hash(r.pw, 10);
    await users.updateOne({ phone: r.phone }, { $set: { password: hash } });
    const doc = await users.findOne({ phone: r.phone });
    const ok = await bcrypt.compare(r.pw, doc.password);
    console.log(`${r.phone}: hashValid=${ok}`);
  }
  
  await client.close();
  console.log('Done — now immediately run the E2E audit!');
}
main().catch(e => { console.error(e.message); process.exit(1); });
