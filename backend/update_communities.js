const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Community = require('./src/models/Community.js');
  
  // Update all communities to allow verified members to create groups instantly
  const res = await Community.updateMany(
    {}, 
    { $set: { 'settings.groupCreationPolicy': 'verified_members_instant' } }
  );
  
  console.log('Communities updated:', res.modifiedCount);
  
  const comms = await Community.find({}).select('name settings.groupCreationPolicy').lean();
  console.log(comms);
  
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
