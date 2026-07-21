const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

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

const getCommunityId = async (commName) => {
  if (!commName) return null;
  const trimmed = commName.trim();
  let commDoc = await Community.findOne({ name: new RegExp('^' + trimmed + '$', 'i') });
  if (!commDoc) {
    try {
      commDoc = await Community.create({ name: trimmed });
    } catch (e) {
      commDoc = await Community.findOne({ name: new RegExp('^' + trimmed + '$', 'i') });
    }
  }
  return commDoc ? commDoc._id : null;
};

const runMigration = async () => {
  try {
    console.log('--- Starting Data Migration & Backfill ---');
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGO_URI);
    }

    const defaultCommunity = await Community.findOne({}) || await Community.create({ name: 'Meri Samaj', city: 'Indore' });
    const defaultCityId = await getCityId('Indore');

    // 1. Backfill USERS (Set missing communityId & cityId)
    const users = await User.find({});
    let usersUpdated = 0;

    for (const user of users) {
      let modified = false;

      if (!user.communityId) {
        if (user.community) {
          const commId = await getCommunityId(user.community);
          if (commId) {
            user.communityId = commId;
            modified = true;
          }
        }
        if (!user.communityId && defaultCommunity) {
          user.communityId = defaultCommunity._id;
          modified = true;
        }
      }

      if (user.assignedCommunityIds && Array.isArray(user.assignedCommunityIds) && user.communityId) {
        if (!user.assignedCommunityIds.some(id => id.toString() === user.communityId.toString())) {
          user.assignedCommunityIds.push(user.communityId);
          modified = true;
        }
      } else if (user.communityId && (!user.assignedCommunityIds || user.assignedCommunityIds.length === 0)) {
        user.assignedCommunityIds = [user.communityId];
        modified = true;
      }

      if (modified) {
        await user.save();
        usersUpdated++;
      }
    }
    console.log(`[Users Migration] Updated ${usersUpdated} out of ${users.length} users.`);

    // 2. Backfill POSTS (Set missing communityId, cityId, feedType, authorId/userId)
    const posts = await Post.find({});
    let postsUpdated = 0;

    for (const post of posts) {
      let modified = false;

      if (!post.authorId && post.userId) {
        post.authorId = post.userId;
        modified = true;
      }
      if (!post.userId && post.authorId) {
        post.userId = post.authorId;
        modified = true;
      }

      let author = null;
      if (post.authorId || post.userId) {
        author = await User.findById(post.authorId || post.userId);
      }

      if (!post.cityId) {
        let cityId = null;
        if (author?.city) {
          cityId = await getCityId(author.city);
        }
        if (!cityId) {
          cityId = defaultCityId;
        }
        if (cityId) {
          post.cityId = cityId;
          modified = true;
        }
      }

      if (!post.communityId) {
        let commId = null;
        if (author?.communityId) {
          commId = author.communityId;
        } else if (author?.community) {
          commId = await getCommunityId(author.community);
        }
        if (!commId && defaultCommunity) {
          commId = defaultCommunity._id;
        }
        if (commId) {
          post.communityId = commId;
          modified = true;
        }
      }

      if (!post.feedType) {
        post.feedType = 'city';
        modified = true;
      }

      if (modified) {
        await post.save();
        postsUpdated++;
      }
    }
    console.log(`[Posts Migration] Updated ${postsUpdated} out of ${posts.length} posts.`);
    console.log('--- Data Migration Complete ---');

    return { usersUpdated, postsUpdated };
  } catch (error) {
    console.error('Error in runMigration:', error);
    throw error;
  }
};

if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = runMigration;
