const mongoose = require('mongoose');
const User = require('./src/models/User');
const Obituary = require('./src/models/Obituary');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://vikashnamdev1111_db_user:vicky123@cluster0.0balpuc.mongodb.net";

const seedTestObituaries = async () => {
  try {
    console.log('Connecting to database to seed obituaries...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find our default member to use as author
    const author = await User.findOne({ phone: '9999999999' }) || await User.findOne({ role: 'user' });
    if (!author) {
      console.error('No user found in database to act as author. Please run the server once first.');
      process.exit(1);
    }

    console.log(`Using author: ${author.name} (Community: ${author.community})`);

    // Clean existing test records first to avoid duplicates
    const deleteRes = await Obituary.deleteMany({
      $or: [
        { deceasedNameEn: 'Ramesh Agrawal' },
        { deceasedNameEn: 'Savitri Devi' },
        { deceasedNameEn: 'Gopal Krishna' },
        { deceasedNameEn: 'Sharda Agrawal' }
      ]
    });
    console.log(`Cleaned up ${deleteRes.deletedCount} old test obituaries.`);

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const twoDaysLaterStr = new Date(Date.now() + 172800000).toISOString().split('T')[0];

    const testObituaries = [
      {
        deceasedName: 'Late Shri Ramesh Agrawal',
        deceasedNameEn: 'Ramesh Agrawal',
        prefix: 'Late Shri',
        age: 78,
        birthDate: '1948-04-12',
        dateOfPassing: '2026-07-10',
        funeralDetails: {
          type: 'Uthawna / Chautha',
          date: tomorrowStr,
          time: '16:00',
          venue: 'Agrawal Dharmashala, Sector-B, Indore, MP'
        },
        message: 'अत्यंत दुख के साथ सूचित करना पड़ रहा है कि हमारे आदरणीय रमेश जी अग्रवाल का स्वर्गवास हो गया है। ईश्वर उनकी आत्मा को शांति प्रदान करे।',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        creatorId: author._id,
        relation: 'Son/Daughter',
        community: author.community,
        status: 'Approved',
        views: 124,
        shares: 12
      },
      {
        deceasedName: 'Late Smt Savitri Devi',
        deceasedNameEn: 'Savitri Devi',
        prefix: 'Late Smt',
        age: 82,
        birthDate: '1944-11-23',
        dateOfPassing: '2026-07-15',
        funeralDetails: {
          type: 'Tehravi / Prayers',
          date: twoDaysLaterStr,
          time: '12:00',
          venue: 'Geeta Bhawan Auditorium, Indore, MP'
        },
        message: 'हमारी प्यारी माताजी सावित्री देवी का स्वर्गवास दिनांक १५ जुलाई को हो गया है। प्रार्थना सभा में आपकी उपस्थिति सादर प्रार्थनीय है।',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
        creatorId: author._id,
        relation: 'Grandson',
        community: author.community,
        status: 'Pending',
        views: 8,
        shares: 0
      },
      {
        deceasedName: 'Late Shri Gopal Krishna',
        deceasedNameEn: 'Gopal Krishna',
        prefix: 'Late Shri',
        age: 65,
        birthDate: '1961-08-15',
        dateOfPassing: '2026-07-16',
        funeralDetails: {
          type: 'Funeral / Last Rites',
          date: todayStr,
          time: '10:00',
          venue: 'Rambagh Crematorium, Indore, MP'
        },
        message: 'श्री गोपाल कृष्ण जी का अचानक हृदयाघात के कारण दुखद निधन हो गया है। अंतिम यात्रा हमारे निवास स्थान से रामबाग मुक्तिधाम के लिए प्रस्थान करेगी।',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
        creatorId: author._id,
        relation: 'Brother',
        community: author.community,
        status: 'Approved',
        views: 45,
        shares: 3
      },
      {
        deceasedName: 'Late Smt Sharda Agrawal',
        deceasedNameEn: 'Sharda Agrawal',
        prefix: 'Late Smt',
        age: 72,
        birthDate: '1954-05-18',
        dateOfPassing: '2026-07-12',
        funeralDetails: {
          type: 'Besna',
          date: tomorrowStr,
          time: '15:00',
          venue: 'Agrawal Samaj Bhawan, Indore, MP'
        },
        message: 'श्रीमती शारदा अग्रवाल जी का दिनांक १२ जुलाई को गोलोकवास हो गया है। शोक संवेदना व्यक्त करने हेतु बैठक दिनांक १८ जुलाई को दोपहर ३ बजे रखी गई है।',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
        creatorId: author._id,
        relation: 'Husband',
        community: author.community,
        status: 'Rejected',
        views: 3,
        shares: 0
      }
    ];

    const seeded = await Obituary.create(testObituaries);
    console.log(`Seeded ${seeded.length} test obituaries successfully!`);

    await mongoose.disconnect();
    console.log('Database disconnected cleanly.');
  } catch (error) {
    console.error('Error seeding test obituaries:', error);
    process.exit(1);
  }
};

seedTestObituaries();
