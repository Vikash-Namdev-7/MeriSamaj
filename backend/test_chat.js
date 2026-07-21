const mongoose = require('mongoose');
require('dotenv').config();
const { openConversation } = require('./src/controllers/matrimonial/matrimonialChatController');
const MatrimonialProfile = require('./src/models/MatrimonialProfile');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find an accepted interest
  const InterestRequest = require('./src/models/InterestRequest');
  const interest = await InterestRequest.findOne({ status: 'accepted' });
  if (!interest) {
    console.log('No accepted interest found');
    process.exit(0);
  }

  const senderId = interest.senderId;
  const receiverId = interest.receiverId;

  // We will pretend we are the sender, calling openConversation for the receiver
  const receiverProfile = await MatrimonialProfile.findOne({ userId: receiverId });
  if (!receiverProfile) {
    console.log('No receiver profile found');
    process.exit(0);
  }

  const req = {
    user: { _id: senderId },
    body: { profileId: receiverProfile._id }
  };
  const res = {
    status: (code) => ({
      json: (data) => console.log(`[${code}]`, data)
    }),
    json: (data) => console.log(`[200]`, data)
  };

  console.log(`Testing openConversation for profile ${receiverProfile._id}`);
  await openConversation(req, res);
  process.exit(0);
}

test().catch(console.error);
