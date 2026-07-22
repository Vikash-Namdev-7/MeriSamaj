const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./src/models/User.js');
  const users = await User.find({ role: 'user' })
    .select('name email verificationStatus communityId')
    .limit(15).lean();
  users.forEach(u => console.log(
    u.name, '|', u.email, 
    '| verified:', u.verificationStatus, 
    '| community:', u.communityId ? 'YES' : 'NO'
  ));
  
  const Conversation = require('./src/models/Conversation.js');
  const totalConvs = await Conversation.countDocuments({ type: 'member', isDeleted: false });
  console.log('\nTotal member conversations in DB:', totalConvs);
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
