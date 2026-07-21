const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/merisamaj';
mongoose.connect(uri).then(async () => {
  const User = require('./src/models/User');
  const all = await User.find({ role: { $in: ['admin','head','community_head','superadmin'] } }).select('name phone email role communityId').lean();
  console.log('PRIVILEGED USERS:', JSON.stringify(all, null, 2));
  const members = await User.find({ role: 'member' }).select('name phone role').limit(5).lean();
  console.log('SAMPLE MEMBERS:', JSON.stringify(members, null, 2));
  mongoose.disconnect();
}).catch(e => console.log('DB ERROR:', e.message));
