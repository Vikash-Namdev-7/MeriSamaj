const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Conversation = require('./src/models/Conversation');
const MatrimonialProfile = require('./src/models/MatrimonialProfile');
const InterestRequest = require('./src/models/InterestRequest');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("Connected to DB");
  
  // Find any accepted interest
  const interest = await InterestRequest.findOne({ status: 'accepted' });
  if (!interest) {
    console.log("No accepted interest found");
    process.exit(0);
  }
  
  console.log("Interest found:", interest._id);
  
  let conversation = await Conversation.findOne({
    referenceId: interest._id
  });
  
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [interest.senderId, interest.receiverId],
      type: 'matrimonial',
      referenceId: interest._id,
      createdBy: interest.receiverId,
      isActive: true
    });
    console.log("Created conversation:", conversation);
  } else {
    console.log("Found existing conversation:", conversation);
  }
  
  console.log("Conversation _id is:", conversation._id);
  console.log("Conversation id is:", conversation.id);
  
  process.exit(0);
});
