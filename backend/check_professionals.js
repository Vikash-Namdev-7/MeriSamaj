const mongoose = require('mongoose');
require('dotenv').config();
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/merisamaj';
mongoose.connect(uri).then(async () => {
  const Professional = require('./src/models/Professional');
  const all = await Professional.find({}).lean();
  console.log('ALL PROFESSIONALS COUNT:', all.length);
  if (all.length > 0) {
    console.log('FIRST PROFESSIONAL:', JSON.stringify(all[0], null, 2));
  } else {
    console.log('NO PROFESSIONALS FOUND');
  }
  mongoose.disconnect();
}).catch(e => console.log('DB ERROR:', e.message));
