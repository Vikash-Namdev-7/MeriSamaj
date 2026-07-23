const mongoose = require('mongoose');
const Profile = require('./src/models/MatrimonialProfile');
const User = require('./src/models/User');

mongoose.connect('mongodb+srv://vikashnamdev1111_db_user:vicky123@cluster0.0balpuc.mongodb.net/test').then(async () => {
  const users = await User.find({ name: { $in: [/nansi/i, /rohit/i, /test/i] } });
  console.log('Users found:', users.map(u => ({ id: u._id, name: u.name })));

  const profiles = await Profile.find({});
  for (const p of profiles) {
    const u = await User.findById(p.userId);
    if (!u) continue;
    if (u.name.match(/nansi/i) || u.name.match(/rohit/i) || u.name.match(/test/i)) {
      console.log({
        user: u.name,
        isClosed: p.isClosed,
        allowPublicStory: p.allowPublicStory,
        marriageConfirmedWith: p.marriageConfirmedWith
      });
    }
  }
  process.exit();
});
