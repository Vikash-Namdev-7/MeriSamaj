const AnnouncementChannel = require('../../models/AnnouncementChannel');
const Conversation = require('../../models/Conversation');

// ─── Get All Global Channels (Admin) ─────────────────────────────────────────
exports.getGlobalChannels = async (req, res) => {
  try {
    const { communityId, search } = req.query;
    
    let query = { isDeleted: false };
    
    if (communityId && communityId !== 'all') {
      query.communityId = communityId;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const channels = await AnnouncementChannel.find(query)
      .populate('communityId', 'name city')
      .populate('creator', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ status: 'success', data: { channels } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get Single Channel Detail (Admin) ───────────────────────────────────────
exports.getChannelById = async (req, res) => {
  try {
    const channel = await AnnouncementChannel.findOne({ _id: req.params.id, isDeleted: false })
      .populate('communityId', 'name city')
      .populate('creator', 'name email avatar');

    if (!channel) return res.status(404).json({ status: 'error', message: 'Channel not found.' });
    res.json({ status: 'success', data: { channel } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Update Posting Permissions (Admin Override) ──────────────────────────────
exports.updateChannelPermission = async (req, res) => {
  try {
    const { whoCanPost } = req.body;
    
    const channel = await AnnouncementChannel.findOne({ _id: req.params.id, isDeleted: false });
    if (!channel) return res.status(404).json({ status: 'error', message: 'Channel not found.' });

    if (whoCanPost) channel.whoCanPost = whoCanPost;
    
    await channel.save();
    res.json({ status: 'success', message: 'Permissions updated successfully.', data: { channel } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Archive / Restore Channel (Admin) ───────────────────────────────────────
exports.archiveChannel = async (req, res) => {
  try {
    const channel = await AnnouncementChannel.findOne({ _id: req.params.id, isDeleted: false });
    if (!channel) return res.status(404).json({ status: 'error', message: 'Channel not found.' });

    channel.isArchived = !channel.isArchived;
    channel.archivedAt = channel.isArchived ? new Date() : null;
    await channel.save();

    res.json({ 
      status: 'success', 
      message: channel.isArchived ? 'Channel archived.' : 'Channel unarchived.', 
      data: { isArchived: channel.isArchived } 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Delete Channel (Admin) ──────────────────────────────────────────────────
exports.deleteChannel = async (req, res) => {
  try {
    const channel = await AnnouncementChannel.findOne({ _id: req.params.id, isDeleted: false });
    if (!channel) return res.status(404).json({ status: 'error', message: 'Channel not found.' });

    channel.isDeleted = true;
    channel.deletedAt = new Date();
    await channel.save();

    if (channel.conversationId) {
      await Conversation.findByIdAndUpdate(channel.conversationId, { isDeleted: true, deletedAt: new Date() });
    }

    res.json({ status: 'success', message: 'Channel deleted successfully.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
