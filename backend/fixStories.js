const mongoose = require('mongoose');
const SuccessStory = require('./src/models/SuccessStory');

mongoose.connect('mongodb+srv://vikashnamdev1111_db_user:vicky123@cluster0.0balpuc.mongodb.net/test').then(async () => {
  // We need to bypass validation since 'eligible' is no longer in enum, but wait, updating to 'draft' IS in enum, so normal update is fine.
  const result = await SuccessStory.updateMany(
    { status: 'eligible' },
    { $set: { status: 'draft' } }
  );
  console.log('Fixed stuck stories:', result);
  process.exit();
});
