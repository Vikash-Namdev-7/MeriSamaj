const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/merisamaj';
mongoose.connect(uri).then(async () => {
  const User = require('./src/models/User');
  const heads = await User.find({ role: 'head' }).lean();
  console.log('HEAD USERS COUNT:', heads.length);
  heads.forEach((h, i) => {
    console.log(`HEAD #${i+1}: name="${h.name}", email="${h.email}", phone="${h.phone}", loginId="${h.loginId}", accountStatus="${h.accountStatus}"`);
  });
  mongoose.disconnect();
}).catch(e => console.log('DB ERROR:', e.message));
