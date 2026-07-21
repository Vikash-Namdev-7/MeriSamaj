/**
 * find_users_and_reset.cjs
 * Finds all users and resets passwords for testing.
 */
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

async function main() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected!\n');

  const User = require('./src/models/User');
  const bcrypt = require('bcryptjs');
  
  // Find all active users
  const users = await User.find({ accountStatus: 'active' })
    .select('name phone email role accountStatus')
    .limit(20).lean();
  
  console.log('=== ALL ACTIVE USERS ===');
  users.forEach(u => console.log(` phone="${u.phone}" email="${u.email}" role="${u.role}" name="${u.name}"`));
  
  // Find admin/head specifically
  const adminHead = await User.find({ role: { $in: ['admin','super_admin','master_admin','head'] } })
    .select('name phone email role accountStatus')
    .lean();
  
  console.log('\n=== ADMIN/HEAD USERS ===');
  adminHead.forEach(u => console.log(` phone="${u.phone}" email="${u.email}" role="${u.role}" name="${u.name}" status="${u.accountStatus}"`));
  
  // Reset passwords for audit use
  const newPw = 'Test@1234';
  const hashed = await bcrypt.hash(newPw, 10);
  
  if (users.length > 0) {
    const memberPhone = users.find(u => u.role === 'member')?.phone;
    if (memberPhone) {
      await User.updateOne({ phone: memberPhone }, { $set: { password: hashed } });
      console.log(`\nReset member password: phone=${memberPhone} pw=${newPw}`);
    }
  }
  
  for (const u of adminHead) {
    const pw = u.role === 'member' ? 'Test@1234' : (u.role.includes('admin') ? 'Admin@1234' : 'Head@1234');
    const h = await bcrypt.hash(pw, 10);
    await User.updateOne({ _id: u._id }, { $set: { password: h, accountStatus: 'active' } });
    console.log(`Reset ${u.role} password: phone="${u.phone}" email="${u.email}" pw=${pw}`);
  }
  
  await mongoose.disconnect();
  console.log('\nDone! Now retry login with above credentials.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
