const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('./src/models/User');
const MatrimonialProfile = require('./src/models/MatrimonialProfile');

async function testApi() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  const senderProfile = await MatrimonialProfile.findOne();
  const senderId = senderProfile.userId;
  
  const receiverProfile = await MatrimonialProfile.findOne({ _id: { $ne: senderProfile._id } });
  
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: senderId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

  try {
    const res = await fetch(`http://localhost:5001/api/v1/member/matrimonial/chat/conversations`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ profileId: receiverProfile._id.toString() })
    });
    
    const data = await res.json();
    console.log("Response data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("API Error:", err);
  }
  
  process.exit(0);
}
testApi();
