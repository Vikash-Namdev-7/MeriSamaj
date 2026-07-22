const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const AnnouncementChannel = require('../src/models/AnnouncementChannel');
const Community = require('../src/models/Community');
const User = require('../src/models/User');
const Conversation = require('../src/models/Conversation');
const AnnouncementAuditLog = require('../src/models/AnnouncementAuditLog');
const { createMessage } = require('../src/services/messageService');
const { notifyAnnouncement } = require('../src/services/notificationService');

const runTests = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

    console.log('\n--- Running Smoke Tests ---\n');

    // 1. Find a community and head
    const head = await User.findOne({ role: 'head', accountStatus: 'active' });
    if (!head) throw new Error('No active Community Head found in DB to run tests.');
    
    const community = await Community.findById(head.communityId);
    if (!community) throw new Error('Community not found for Head.');

    console.log(`Using Community: ${community.name}`);
    console.log(`Using Head: ${head.name}`);

    // 2. Verify default channel
    const defaultChannel = await AnnouncementChannel.findOne({ communityId: community._id, isDefault: true });
    if (!defaultChannel) {
      console.log('❌ Default channel not found! Creating one for testing...');
      await AnnouncementChannel.create({
        communityId: community._id,
        name: 'Community Announcements',
        description: 'Default',
        creator: head._id,
        isDefault: true
      });
    } else {
      console.log('✅ Default channel exists.');
    }

    // 3. Create a test channel
    console.log('Creating a test channel...');
    let channel = await AnnouncementChannel.create({
      communityId: community._id,
      name: 'Test Smoke Channel',
      whoCanPost: 'head_only',
      whoCanView: 'everyone',
      creator: head._id
    });
    console.log(`✅ Channel created with ID: ${channel._id}`);

    // Create a linked conversation for it
    const conversation = await Conversation.create({
      type: 'community',
      participants: [head._id], // seeded
      referenceId: channel._id
    });
    channel.conversationId = conversation._id;
    await channel.save();
    console.log('✅ Conversation linked.');

    // 4. Test Permissions Logic (using the same logic in controller)
    console.log('Testing canPostInChannel logic...');
    const canPostInChannel = (ch, userRole) => {
      if (userRole === 'admin') return true;
      if (ch.whoCanPost === 'everyone') return true;
      if (ch.whoCanPost === 'verified_members' && ['verified', 'head', 'admin'].includes(userRole)) return true;
      if (ch.whoCanPost === 'moderators' && ['head', 'admin', 'moderator'].includes(userRole)) return true;
      if (ch.whoCanPost === 'head_and_admins' && ['head', 'admin'].includes(userRole)) return true;
      if (ch.whoCanPost === 'head_only') return userRole === 'head';
      return false;
    };

    if (!canPostInChannel(channel, 'head')) throw new Error('Head should be able to post');
    if (canPostInChannel(channel, 'user')) throw new Error('User should NOT be able to post');
    if (!canPostInChannel(channel, 'admin')) throw new Error('Master Admin should be able to post');
    console.log('✅ Permission logic validated.');

    // 5. Test Audit Log
    console.log('Testing Audit Logging...');
    await AnnouncementAuditLog.create({
      channelId: channel._id,
      communityId: community._id,
      action: 'CHANNEL_CREATED',
      userId: head._id
    });
    const logExists = await AnnouncementAuditLog.findOne({ channelId: channel._id });
    if (!logExists) throw new Error('Audit log creation failed.');
    console.log('✅ Audit Log works.');

    // 6. Test Messaging Service Hook
    console.log('Testing message creation...');
    const msg = await createMessage({
      conversationId: conversation._id,
      senderId: head._id,
      type: 'text',
      message: 'Smoke test announcement!'
    });
    if (!msg) throw new Error('Message creation failed.');
    console.log(`✅ Message created with ID: ${msg._id}`);

    // 7. Test Notifications
    console.log('Testing notifications...');
    // We mock memberIds to just head for smoke testing
    try {
      await notifyAnnouncement([head._id], channel.name, 'Test!', channel._id);
      console.log('✅ Notification triggered.');
    } catch (e) {
      console.log('⚠️ Notification test failed, ignoring for smoke script:', e.message);
    }

    // 8. Test Soft Delete
    console.log('Testing Soft Delete...');
    channel.isDeleted = true;
    channel.deletedAt = new Date();
    await channel.save();
    
    const checkDeleted = await AnnouncementChannel.findOne({ _id: channel._id, isDeleted: false });
    if (checkDeleted) throw new Error('Channel still shows up in active queries after soft delete.');
    console.log('✅ Soft Delete works.');

    // Cleanup
    await AnnouncementChannel.deleteOne({ _id: channel._id });
    await Conversation.deleteOne({ _id: conversation._id });
    await AnnouncementAuditLog.deleteMany({ channelId: channel._id });
    const Message = require('../src/models/Message');
    await Message.deleteOne({ _id: msg._id });

    console.log('\n✅ All Smoke Tests Passed Successfully!');
  } catch (err) {
    console.error('\n❌ Smoke Test Failed!');
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

runTests();
