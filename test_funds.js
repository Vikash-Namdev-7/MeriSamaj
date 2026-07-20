const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend
dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const User = require('./backend/src/models/User');
const Fund = require('./backend/src/models/Fund');
const { getFundsData } = require('./backend/src/controllers/member/fundController');

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://vikashnamdev1111_db_user:vicky123@cluster0.0balpuc.mongodb.net';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected!');

    // Find the first member with a communityId
    const user = await User.findOne({ role: 'user', communityId: { $ne: null } });
    if (!user) {
      console.log('No user with communityId found!');
      process.exit(1);
    }
    console.log('Testing with User:', user.name, 'role:', user.role, 'communityId:', user.communityId);

    const req = {
      user: { _id: user._id },
      communityId: user.communityId,
    };

    const res = {
      status: (code) => {
        console.log('Response Status:', code);
        return res;
      },
      json: (data) => {
        console.log('Response JSON:', JSON.stringify(data, null, 2));
        process.exit(0);
      }
    };

    await getFundsData(req, res);

  } catch (error) {
    console.error('CRITICAL ERROR IN GET_FUNDS_DATA:', error);
    process.exit(1);
  }
}

run();
