const Group = require('../../models/Group');
const GroupAuditLog = require('../../models/GroupAuditLog');
const GroupReport = require('../../models/GroupReport');
const Conversation = require('../../models/Conversation');
const { findOrCreateGroupConversation } = require('../../services/conversationService');

/**
 * Helper to log audit actions
 */
const logAction = async (groupId, communityId, action, userId, metadata = {}) => {
  try {
    await GroupAuditLog.create({ group: groupId, communityId, action, performedBy: userId, metadata });
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

// ─── Core Management ────────────────────────────────────────────────────────
exports.getGroups = async (req, res) => {
  try {
    const { status, category, type, search, page = 1, limit = 20 } = req.query;
    const communityId = req.communityId;

    const filter = { communityId, isDeleted: false };
    if (status && status !== 'all') filter.approvalStatus = status;
    if (category && category !== 'all') filter.category = category;
    if (type && type !== 'all') filter.type = type;
    if (search) filter.$text = { $search: search };

    const total = await Group.countDocuments(filter);
    const groups = await Group.find(filter)
      .select('name description avatar category type approvalStatus chatPermissions isArchived createdAt members creator')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('creator', 'name avatar role');

    // Format for dashboard
    const enriched = groups.map(g => ({
      ...g.toObject(),
      memberCount: g.members ? g.members.length : 0,
      adminCount: g.members ? g.members.filter(m => ['admin', 'head'].includes(m.role)).length : 0
    }));

    res.json({ status: 'success', data: { groups: enriched, total, page: Number(page) } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findOne({ _id: id, communityId: req.communityId, isDeleted: false })
      .populate('creator', 'name avatar')
      .populate('members.userId', 'name avatar role phone verificationStatus');

    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found' });

    res.json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, description, category, type, chatPermissions } = req.body;
    
    // Head can create any group directly, bypasses community policy.
    const newGroup = new Group({
      name,
      description,
      category,
      type: type || 'public',
      creator: req.user._id,
      communityId: req.communityId,
      approvalStatus: 'approved', // Auto-approved for head
      approvedBy: req.user._id,
      approvedAt: Date.now(),
      chatPermissions: chatPermissions || {}
    });

    // Head is always added as 'head' role
    newGroup.members.push({ userId: req.user._id, role: 'head' });
    await newGroup.save();

    // Init chat
    const conv = await findOrCreateGroupConversation(newGroup._id, req.communityId);
    newGroup.conversationId = conv._id;
    await newGroup.save();

    await logAction(newGroup._id, req.communityId, 'group_created', req.user._id, { type: newGroup.type });

    res.status(201).json({ status: 'success', data: { group: newGroup } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.updateGroupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }

    const group = await Group.findOne({ _id: id, communityId: req.communityId });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found' });

    group.approvalStatus = status;
    if (status === 'approved') {
      group.approvedBy = req.user._id;
      group.approvedAt = Date.now();
      if (!group.conversationId) {
        const conv = await findOrCreateGroupConversation(group._id, req.communityId);
        group.conversationId = conv._id;
      }
    }
    
    await group.save();
    await logAction(group._id, req.communityId, `group_${status}`, req.user._id);

    res.json({ status: 'success', message: `Group ${status} successfully`, data: { group } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.archiveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findOne({ _id: id, communityId: req.communityId });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found' });

    group.isArchived = true;
    group.archivedAt = Date.now();
    await group.save();
    
    await logAction(group._id, req.communityId, 'group_archived', req.user._id);
    res.json({ status: 'success', message: 'Group archived' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.restoreGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findOne({ _id: id, communityId: req.communityId });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found' });

    group.isArchived = false;
    group.archivedAt = null;
    await group.save();
    
    await logAction(group._id, req.communityId, 'group_restored', req.user._id);
    res.json({ status: 'success', message: 'Group restored' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findOne({ _id: id, communityId: req.communityId });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found' });

    group.isDeleted = true;
    group.deletedAt = Date.now();
    await group.save();

    await logAction(group._id, req.communityId, 'group_deleted', req.user._id);
    res.json({ status: 'success', message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
