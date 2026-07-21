const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/merisamaj';
mongoose.connect(uri).then(async () => {
  const User = require('./src/models/User');
  
  const admin = await User.findOne({ role: 'admin' });
  if (admin) {
    admin.password = 'Admin@1234';
    await admin.save();
    console.log('Admin password reset to Admin@1234');
  }

  const head = await User.findOne({ role: 'head' });
  if (head) {
    head.password = 'Head@1234';
    await head.save();
    console.log('Head password reset to Head@1234');
  }

  mongoose.disconnect();
}).catch(e => console.log('DB ERROR:', e.message));
