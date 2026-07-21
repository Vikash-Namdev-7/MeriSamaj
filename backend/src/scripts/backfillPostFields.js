const mongoose = require('mongoose');
require('dotenv').config();

const Post = require('../models/Post');
const User = require('../models/User');
const City = require('../models/City');
const Community = require('../models/Community');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/merisamaj';

const getCityId = async (cityName) => {
  if (!cityName) return null;
  const trimmed = cityName.trim();
  let cityDoc = await City.findOne({ name: new RegExp('^' + trimmed + '$', 'i') });
  if (!cityDoc) {
    try {
      cityDoc = await City.create({ name: trimmed });
    } catch (e) {
      cityDoc = await City.findOne({ name: new RegExp('^' + trimmed + '$', 'i') });
    }
  }
  return cityDoc ? cityDoc._id : null;
};

const runBackfill = async () => {
  try {
    console.log('Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully. Starting Post backfill...');

    const posts = await Post.find({});
    console.log(`Found ${posts.length} posts to inspect.`);

    let updatedCount = 0;
    const defaultCommunity = await Community.findOne({});

    for (const post of posts) {
      let modified = false;

      // 1. Align authorId / userId
      if (!post.authorId && post.userId) {
        post.authorId = post.userId;
        modified = true;
      }
      if (!post.userId && post.authorId) {
        post.userId = post.authorId;
        modified = true;
      }

      // Fetch author doc if needed for missing location/community
      let author = null;
      if (post.authorId || post.userId) {
        author = await User.findById(post.authorId || post.userId);
      }

      // 2. Populate missing cityId
      if (!post.cityId && author) {
        const userCity = author.city || author.workCity || 'Indore';
        const resolvedCityId = await getCityId(userCity);
        if (resolvedCityId) {
          post.cityId = resolvedCityId;
          modified = true;
        }
      }

      // 3. Populate missing communityId
      if (!post.communityId) {
        if (author?.communityId) {
          post.communityId = author.communityId;
          modified = true;
        } else if (author?.community) {
          let commDoc = await Community.findOne({ name: author.community });
          if (!commDoc) {
            commDoc = await Community.create({ name: author.community, city: author.city || 'Indore' });
          }
          post.communityId = commDoc._id;
          modified = true;
        } else if (defaultCommunity) {
          post.communityId = defaultCommunity._id;
          modified = true;
        }
      }

      // 4. Populate missing feedType
      if (!post.feedType) {
        post.feedType = 'city';
        modified = true;
      }

      if (modified) {
        await post.save();
        updatedCount++;
      }
    }

    console.log(`Backfill complete. Updated ${updatedCount} posts out of ${posts.length}.`);
    process.exit(0);
  } catch (error) {
    console.error('Error running backfill:', error);
    process.exit(1);
  }
};

runBackfill();
