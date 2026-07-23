const mongoose = require('mongoose');
const Profile = require('./src/models/MatrimonialProfile');
const User = require('./src/models/User');

mongoose.connect('mongodb+srv://vikashnamdev1111_db_user:vicky123@cluster0.0balpuc.mongodb.net/test').then(async () => {
  const profiles = await Profile.find({});
  for (const p of profiles) {
    const u = await User.findById(p.userId);
    if (!u) continue;
    if (u.name.match(/nansi/i) || u.name.match(/rohit/i) || u.name.match(/test/i)) {
      if (p.isClosed) {
        p.allowPublicStory = true;
        await p.save();
        console.log(`Updated ${u.name} to allowPublicStory = true`);
      }
    }
  }
  console.log("Done");
  process.exit();
});
