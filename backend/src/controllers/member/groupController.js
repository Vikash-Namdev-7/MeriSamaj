/**
 * groupController.js
 * REST endpoints for Community Group management.
 * Real-time messages handled by chatSocketService.js
 *
 * Permission model:
 *  - createGroup: depends on community.settings.groupCreationPolicy
 *  - updateGroup / deleteGroup: group admin or head
 *  - addMember / removeMember: group admin or head
 *  - promoteToAdmin / demoteAdmin: community head only
 */
const Group        = require('../../models/Group');
const Community    = require('../../models/Community');
const User         = require('../../models/User');
const Conversation = require('../../models/Conversation');
const GroupJoinRequest = require('../../models/GroupJoinRequest');
const {
  findOrCreateGroupConversation,
  addParticipant,
  removeParticipant
} = require('../../services/conversationService');
const {
  notifyGroupInvite,
  notifyGroupJoinRequest,
  notifyGroupJoinApproved,
  notifyGroupRemoved
} = require('../../services/notificationService');

// ─── Helper: Get group with member check ─────────────────────────────────────
const getGroupAndVerifyMember = async (groupId, userId) => {
  const group = await Group.findOne({ _id: groupId, isDeleted: false });
  if (!group) throw { status: 404, message: 'Group not found.' };
  if (!group.isMember(userId)) throw { status: 403, message: 'You are not a member of this group.' };
  return group;
};

// ─── Create Group ────────────────────────────────────────────────────────────
exports.createGroup = async (req, res) => {
  try {
    const { name, description, category, type, chatPermissions, initialMembers } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ status: 'error', message: 'Group name is required.' });
    }

    const userId = req.user._id;
    // req.user.communityId may be a populated Community object
    const communityId = req.user.communityId?._id || req.user.communityId;

    if (!communityId) {
      return res.status(400).json({ status: 'error', message: 'User must belong to a community to create groups.' });
    }

    // Verify user is verified
    if (req.user.verificationStatus !== 'verified') {
      return res.status(403).json({ status: 'error', message: 'Only verified members can create groups.' });
    }

    // Fetch community settings (use raw ID)
    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ status: 'error', message: 'Community not found.' });
    }

    const policy = community.settings?.groupCreationPolicy || 'head_admin';

    const userRole = req.user.role; // 'user' | 'admin' | 'head'

    // Check policy
    let approvalStatus = 'approved';

    if (policy === 'head_only') {
      if (userRole !== 'head') {
        return res.status(403).json({ status: 'error', message: 'Only the Community Head can create groups.' });
      }
    } else if (policy === 'head_admin' || policy === 'head_and_admin') {
      if (userRole !== 'head' && userRole !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'Only the Community Head or Admin can create groups.' });
      }
    } else if (policy === 'verified_with_approval' || policy === 'verified_members_approval') {
      // Any verified member — but needs approval from head
      if (userRole !== 'head') {
        approvalStatus = 'pending';
      }
    }
    // 'verified_members_instant' | 'verified_instant' — any verified member, instant approval
    // (no extra check needed — falls through with approvalStatus = 'approved')

    // Handle avatar upload
    let avatarUrl = null;
    let avatarPublicId = null;
    if (req.file) {
      avatarUrl = req.file.path || null;
      avatarPublicId = req.file.filename || req.file.public_id || null;
    }

    // Determine creator's role in group
    const creatorGroupRole = userRole === 'head' ? 'head' : 'admin';

    const group = await Group.create({
      communityId,
      name: name.trim(),
      description: description?.trim() || '',
      category: category || 'General',
      type: type || 'public',
      creator: userId,
      approvalStatus,
      avatar: avatarUrl,
      avatarPublicId,
      chatPermissions: chatPermissions || {},
      members: [{ userId, role: creatorGroupRole, joinedAt: new Date() }]
    });

    // Create a linked Conversation for the group
    const { conversation } = await findOrCreateGroupConversation(
      group._id,
      [userId],
      'group',
      userId
    );

    // Link conversation to group
    group.conversationId = conversation._id;
    await group.save();

    // If pending approval, notify head
    if (approvalStatus === 'pending' && community.headId) {
      notifyGroupJoinRequest(
        community.headId,
        req.user.name,
        group._id,
        group.name
      );
    }

    // Process Initial Members
    let memberIds = [];
    if (initialMembers) {
      try {
        memberIds = typeof initialMembers === 'string' ? JSON.parse(initialMembers) : initialMembers;
      } catch(e) {}
    }

    if (Array.isArray(memberIds) && memberIds.length > 0) {
      const validUsers = await User.find({ _id: { $in: memberIds }, communityId, accountStatus: 'active' }).select('_id');
      const validIds = validUsers.map(u => u._id.toString());
      
      if (validIds.length > 0) {
        if (group.type === 'public') {
          // Add directly
          validIds.forEach(id => {
             group.members.push({ userId: id, role: 'member', joinedAt: new Date(), addedBy: userId });
             // Notify
             notifyGroupInvite(id, req.user.name, group._id, group.name);
          });
          await group.save();
          await addParticipant(conversation._id, validIds);
        } else {
          // Private / Invite Only -> Create Invitations
          const GroupInvitation = require('../../models/GroupInvitation');
          const invitations = validIds.map(id => ({
             group: group._id,
             communityId,
             user: id,
             invitedBy: userId,
             status: 'pending'
          }));
          await GroupInvitation.insertMany(invitations, { ordered: false }).catch(() => {});
          
          validIds.forEach(id => {
            notifyGroupInvite(id, req.user.name, group._id, group.name);
          });
        }
      }
    }

    res.status(201).json({
      status: 'success',
      data: { group: { ...group.toObject(), memberCount: group.memberCount } }
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ status: 'error', message: err.message });
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get Groups (Paginated + Filterable) ─────────────────────────────────────
exports.getGroups = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, type } = req.query;
    const communityId = req.user.communityId?._id || req.user.communityId;
    if (!communityId) return res.status(400).json({ status: 'error', message: 'Community not found.' });

    const filter = {
      communityId,
      isDeleted: false,
      approvalStatus: 'approved'
    };
    if (category && category !== 'all') filter.category = category;
    if (type)     filter.type = type;
    if (search) {
      filter.$text = { $search: search };
    }

    const total = await Group.countDocuments(filter);
    const groups = await Group.find(filter)
      .select('name description avatar category type members creator approvalStatus chatPermissions conversationId createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('creator', 'name avatar');

    // Attach isJoined flag and member count for current user
    const userId = req.user._id.toString();
    const enriched = groups.map(g => ({
      ...g.toObject(),
      memberCount: g.members.length,
      isJoined: g.members.some(m => m.userId.toString() === userId),
      myRole: (g.members.find(m => m.userId.toString() === userId) || {}).role || null
    }));

    res.json({ status: 'success', data: { groups: enriched, total, page: Number(page) } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get My Groups ───────────────────────────────────────────────────────────
exports.getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const communityId = req.user.communityId?._id || req.user.communityId;

    const groups = await Group.find({
      communityId,
      'members.userId': userId,
      isDeleted: false,
      approvalStatus: 'approved'
    })
      .select('name description avatar category type members creator chatPermissions conversationId updatedAt')
      .populate('creator', 'name avatar');

    const { getUserConversations } = require('../../services/conversationService');
    const conversations = await getUserConversations(userId, 'group', 100);
    const convMap = {};
    conversations.forEach(c => {
      convMap[c._id.toString()] = c;
    });

    const enriched = groups.map(g => {
      const conv = convMap[g.conversationId?.toString()];
      return {
        ...g.toObject(),
        memberCount: g.members.length,
        isJoined: true,
        myRole: (g.members.find(m => m.userId.toString() === userId.toString()) || {}).role || 'member',
        
        // Chat normalization fields
        conversationId: g.conversationId,
        lastMessageAt: conv ? conv.lastMessageAt : null,
        lastMessagePreview: conv ? conv.lastMessagePreview : '',
        unreadCount: conv ? conv.unreadCount : 0,
        lastMessageSender: conv && conv.lastMessageId ? conv.lastMessageId.senderId : null,
      };
    });

    res.json({ status: 'success', data: { groups: enriched } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get Group Members ────────────────────────────────────────────────────────
exports.getGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findOne({ _id: id, isDeleted: false })
      .populate('members.userId', 'name avatar verificationStatus phone');

    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found.' });

    // For private groups, only members can see members
    if (group.type !== 'public' && !group.isMember(userId)) {
      return res.status(403).json({ status: 'error', message: 'Access denied.' });
    }

    const members = group.members.map(m => ({
      _id: m.userId?._id,
      name: m.userId?.name,
      avatar: m.userId?.avatar,
      verificationStatus: m.userId?.verificationStatus,
      role: m.role,
      joinedAt: m.joinedAt,
      addedBy: m.addedBy
    }));

    res.json({ status: 'success', data: { members, total: members.length } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId  = req.user._id.toString();

    const group = await Group.findOne({ _id: id, isDeleted: false })
      .populate('creator', 'name avatar')
      .populate('members.userId', 'name avatar verificationStatus');

    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found.' });

    // For private/invite_only groups, only members can see details
    if (group.type !== 'public' && !group.isMember(userId)) {
      return res.status(403).json({ status: 'error', message: 'This is a private group.' });
    }

    res.json({
      status: 'success',
      data: {
        group: {
          ...group.toObject(),
          memberCount: group.members.length,
          isJoined: group.isMember(userId),
          myRole: group.getMemberRole(userId)
        }
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Update Group ─────────────────────────────────────────────────────────────
exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId  = req.user._id;
    const { name, description, category, type } = req.body;

    const group = await Group.findOne({ _id: id, isDeleted: false });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found.' });

    if (!group.canPerform(userId, 'canEditGroupInfo')) {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to edit this group.' });
    }

    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description.trim();
    if (category) group.category = category;
    if (type) group.type = type;

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar from Cloudinary
      if (group.avatarPublicId) {
        try {
          const cloudinary = require('cloudinary').v2;
          await cloudinary.uploader.destroy(group.avatarPublicId);
        } catch (e) { /* non-critical */ }
      }
      group.avatar = req.file.path || null;
      group.avatarPublicId = req.file.filename || req.file.public_id || null;
    }

    await group.save();
    res.json({ status: 'success', data: { group } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Delete Group ─────────────────────────────────────────────────────────────
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId  = req.user._id;

    const group = await Group.findOne({ _id: id, isDeleted: false });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found.' });

    // Only head role or community head can delete
    if (!group.hasMinRole(userId, 'head') && req.user.role !== 'head') {
      return res.status(403).json({ status: 'error', message: 'Only the Community Head can delete groups.' });
    }

    group.isDeleted = true;
    group.deletedAt = new Date();
    await group.save();

    // Soft-delete linked conversation
    if (group.conversationId) {
      await Conversation.findByIdAndUpdate(group.conversationId, { isDeleted: true, deletedAt: new Date() });
    }

    // Notify all members
    const memberIds = group.members
      .filter(m => m.userId.toString() !== userId.toString())
      .map(m => m.userId);
    for (const memberId of memberIds) {
      notifyGroupRemoved(memberId, group.name);
    }

    res.json({ status: 'success', message: 'Group deleted successfully.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Join Group ───────────────────────────────────────────────────────────────
exports.joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId  = req.user._id;

    const group = await Group.findOne({ _id: id, isDeleted: false, approvalStatus: 'approved' });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found.' });

    // Must be same community — req.user.communityId may be a populated object
    const userCommunityId = req.user.communityId?._id || req.user.communityId;
    if (group.communityId.toString() !== userCommunityId?.toString()) {
      return res.status(403).json({ status: 'error', message: 'You can only join groups within your community.' });
    }

    if (group.isMember(userId)) {
      return res.status(400).json({ status: 'error', message: 'You are already a member of this group.' });
    }

    if (group.type === 'invite_only') {
      return res.status(403).json({ status: 'error', message: 'This is an invite-only group. You must be added by an admin.' });
    }

    if (group.type === 'private') {
      // Create Join Request
      const existingRequest = await GroupJoinRequest.findOne({ group: group._id, user: userId, status: 'pending' });
      if (existingRequest) {
        return res.status(400).json({ status: 'error', message: 'You already have a pending join request for this group.' });
      }

      await GroupJoinRequest.create({
        group: group._id,
        communityId: group.communityId,
        user: userId,
        status: 'pending'
      });

      // Optionally notify admins
      const adminIds = group.members.filter(m => ['admin', 'head'].includes(m.role)).map(m => m.userId);
      adminIds.forEach(adminId => {
        notifyGroupJoinRequest(adminId, req.user.name, group._id, group.name);
      });

      return res.json({ status: 'success', message: 'Join request sent successfully. Pending approval.', data: { status: 'pending' } });
    }

    group.members.push({ userId, role: 'member', joinedAt: new Date() });
    await group.save();

    // Add to conversation
    if (group.conversationId) {
      await addParticipant(group.conversationId, userId);
    }

    // System message
    const { createMessage } = require('../../services/messageService');
    if (group.conversationId) {
      await createMessage({
        conversationId: group.conversationId,
        senderId: userId,
        type: 'system',
        message: `${req.user.name} joined the group.`
      });
    }

    // Notify socket room
    const io = req.app.get('io');
    if (io && group.conversationId) {
      io.to(`conv:${group.conversationId}`).emit('chat:member_joined', {
        groupId: group._id,
        userId,
        name: req.user.name
      });
    }

    res.json({ status: 'success', message: 'Joined group successfully.', data: { groupId: group._id } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Leave Group ──────────────────────────────────────────────────────────────
exports.leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId  = req.user._id;

    const group = await getGroupAndVerifyMember(id, userId);

    // Head cannot leave — must transfer or delete
    if (group.getMemberRole(userId) === 'head') {
      return res.status(400).json({ status: 'error', message: 'Group head cannot leave. Please delete the group or assign a new head.' });
    }

    group.members = group.members.filter(m => m.userId.toString() !== userId.toString());
    await group.save();

    if (group.conversationId) {
      await removeParticipant(group.conversationId, userId);
    }

    // System message
    const { createMessage } = require('../../services/messageService');
    if (group.conversationId) {
      await createMessage({
        conversationId: group.conversationId,
        senderId: userId,
        type: 'system',
        message: `${req.user.name} left the group.`
      });
    }

    const io = req.app.get('io');
    if (io && group.conversationId) {
      io.to(`conv:${group.conversationId}`).emit('chat:member_left', {
        groupId: group._id,
        userId,
        name: req.user.name
      });
    }

    res.json({ status: 'success', message: 'Left group successfully.' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ status: 'error', message: err.message });
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Invite / Add Members ─────────────────────────────────────────────────────
exports.inviteMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    const requesterId = req.user._id;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ status: 'error', message: 'userIds array is required.' });
    }

    const group = await Group.findOne({ _id: id, isDeleted: false });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found.' });

    if (!group.canPerform(requesterId, 'canAddMembers')) {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to add members.' });
    }

    const validUsers = await User.find({
      _id: { $in: userIds },
      communityId: req.user.communityId?._id || req.user.communityId,
      accountStatus: 'active'
    }).select('name avatar');

    const validUserIds = validUsers.map(u => u._id.toString());
    const newMembers = validUserIds.filter(uid => !group.isMember(uid));

    if (newMembers.length === 0) {
      return res.status(400).json({ status: 'error', message: 'All selected users are already members or invalid.' });
    }

    const io = req.app.get('io');
    const { notifyGroupInvite } = require('../../services/notificationService');

    if (group.type === 'public') {
      // Add instantly
      newMembers.forEach(uid => {
        group.members.push({ userId: uid, role: 'member', joinedAt: new Date(), addedBy: requesterId });
        notifyGroupInvite(uid, req.user.name, group._id, group.name);
      });
      await group.save();

      if (group.conversationId) {
        await addParticipant(group.conversationId, newMembers);
      }

      if (io && group.conversationId) {
        validUsers.forEach(u => {
          if (newMembers.includes(u._id.toString())) {
            io.to(`conv:${group.conversationId}`).emit('chat:member_added', {
              groupId: group._id,
              user: { _id: u._id, name: u.name, avatar: u.avatar }
            });
          }
        });
      }
      return res.json({ status: 'success', message: `${newMembers.length} members added instantly.` });
    } else {
      // Create Invitations
      const GroupInvitation = require('../../models/GroupInvitation');
      const invitations = newMembers.map(uid => ({
         group: group._id,
         communityId: group.communityId,
         user: uid,
         invitedBy: requesterId,
         status: 'pending'
      }));
      await GroupInvitation.insertMany(invitations, { ordered: false }).catch(() => {});
      
      newMembers.forEach(uid => {
        notifyGroupInvite(uid, req.user.name, group._id, group.name);
      });
      return res.json({ status: 'success', message: `Invitations sent to ${newMembers.length} members.` });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get Pending Invitations ──────────────────────────────────────────────────
exports.getPendingInvitations = async (req, res) => {
  try {
    const GroupInvitation = require('../../models/GroupInvitation');
    const invitations = await GroupInvitation.find({ user: req.user._id, status: 'pending' })
      .populate('group', 'name avatarUrl description type category')
      .populate('invitedBy', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ status: 'success', data: invitations });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Accept Invitation ────────────────────────────────────────────────────────
exports.acceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user._id;
    const GroupInvitation = require('../../models/GroupInvitation');

    const invitation = await GroupInvitation.findOne({ _id: invitationId, user: userId, status: 'pending' });
    if (!invitation) return res.status(404).json({ status: 'error', message: 'Invitation not found or already processed.' });

    const group = await Group.findOne({ _id: invitation.group, isDeleted: false });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group no longer exists.' });

    invitation.status = 'accepted';
    invitation.resolvedAt = new Date();
    await invitation.save();

    if (!group.isMember(userId)) {
      group.members.push({ userId, role: 'member', joinedAt: new Date(), addedBy: invitation.invitedBy });
      await group.save();

      if (group.conversationId) {
        await addParticipant(group.conversationId, userId);
      }

      const { notifyGroupInviteAccepted } = require('../../services/notificationService');
      notifyGroupInviteAccepted(invitation.invitedBy, req.user.name, group.name);

      const io = req.app.get('io');
      if (io && group.conversationId) {
        io.to(`conv:${group.conversationId}`).emit('chat:member_added', {
          groupId: group._id,
          user: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar }
        });
      }
    }

    res.json({ status: 'success', message: 'Invitation accepted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Decline Invitation ───────────────────────────────────────────────────────
exports.declineInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user._id;
    const GroupInvitation = require('../../models/GroupInvitation');

    const invitation = await GroupInvitation.findOne({ _id: invitationId, user: userId, status: 'pending' }).populate('group');
    if (!invitation) return res.status(404).json({ status: 'error', message: 'Invitation not found or already processed.' });

    invitation.status = 'declined';
    invitation.resolvedAt = new Date();
    await invitation.save();

    if (invitation.group) {
      const { notifyGroupInviteDeclined } = require('../../services/notificationService');
      notifyGroupInviteDeclined(invitation.invitedBy, req.user.name, invitation.group.name);
    }

    res.json({ status: 'success', message: 'Invitation declined.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Remove Member ────────────────────────────────────────────────────────────
exports.removeMember = async (req, res) => {
  try {
    const { id, userId: targetUserId } = req.params;
    const requesterId = req.user._id;

    const group = await Group.findOne({ _id: id, isDeleted: false });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found.' });

    if (!group.canPerform(requesterId, 'canRemoveMembers')) {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to remove members.' });
    }

    // Cannot remove someone with higher or equal role
    const requesterRole = group.getMemberRole(requesterId);
    const targetRole    = group.getMemberRole(targetUserId);
    const ROLE_LEVEL    = { head: 4, admin: 3, moderator: 2, member: 1 };
    if ((ROLE_LEVEL[targetRole] || 0) >= (ROLE_LEVEL[requesterRole] || 0)) {
      return res.status(403).json({ status: 'error', message: 'You cannot remove a member with equal or higher role.' });
    }

    group.members = group.members.filter(m => m.userId.toString() !== targetUserId.toString());
    await group.save();

    if (group.conversationId) {
      await removeParticipant(group.conversationId, targetUserId);
    }

    notifyGroupRemoved(targetUserId, group.name);

    const io = req.app.get('io');
    if (io) {
      io.to(`user:${targetUserId}`).emit('chat:removed_from_group', { groupId: group._id, groupName: group.name });
      if (group.conversationId) {
        io.to(`conv:${group.conversationId}`).emit('chat:member_removed', { groupId: group._id, userId: targetUserId });
      }
    }

    res.json({ status: 'success', message: 'Member removed.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Promote to Admin ─────────────────────────────────────────────────────────
exports.promoteToAdmin = async (req, res) => {
  try {
    const { id, userId: targetUserId } = req.params;
    const requesterId = req.user._id;

    const group = await Group.findOne({ _id: id, isDeleted: false });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found.' });

    // Only head role can promote
    if (!group.hasMinRole(requesterId, 'head') && req.user.role !== 'head') {
      return res.status(403).json({ status: 'error', message: 'Only the Community Head can promote admins.' });
    }

    const memberIndex = group.members.findIndex(m => m.userId.toString() === targetUserId.toString());
    if (memberIndex === -1) return res.status(404).json({ status: 'error', message: 'Member not found in group.' });

    group.members[memberIndex].role = 'admin';
    await group.save();

    const { notifyGroupPromoted } = require('../../services/notificationService');
    notifyGroupPromoted(targetUserId, group.name);

    const io = req.app.get('io');
    if (io && group.conversationId) {
      io.to(`conv:${group.conversationId}`).emit('chat:member_promoted', { groupId: group._id, userId: targetUserId, role: 'admin' });
    }

    res.json({ status: 'success', message: 'Member promoted to admin.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Demote Admin ─────────────────────────────────────────────────────────────
exports.demoteAdmin = async (req, res) => {
  try {
    const { id, userId: targetUserId } = req.params;
    const requesterId = req.user._id;

    const group = await Group.findOne({ _id: id, isDeleted: false });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found.' });

    if (!group.hasMinRole(requesterId, 'head') && req.user.role !== 'head') {
      return res.status(403).json({ status: 'error', message: 'Only the Community Head can demote admins.' });
    }

    const memberIndex = group.members.findIndex(m => m.userId.toString() === targetUserId.toString());
    if (memberIndex === -1) return res.status(404).json({ status: 'error', message: 'Member not found.' });

    group.members[memberIndex].role = 'member';
    await group.save();

    const { notifyGroupDemoted } = require('../../services/notificationService');
    notifyGroupDemoted(targetUserId, group.name);

    const io = req.app.get('io');
    if (io && group.conversationId) {
      io.to(`conv:${group.conversationId}`).emit('chat:member_demoted', { groupId: group._id, userId: targetUserId, role: 'member' });
    }

    res.json({ status: 'success', message: 'Admin demoted to member.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Update Group Settings (Chat Permissions) ─────────────────────────────────
exports.updateGroupSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const userId  = req.user._id;
    const { chatPermissions } = req.body;

    const group = await Group.findOne({ _id: id, isDeleted: false });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found.' });

    if (!group.canPerform(userId, 'canChangeSettings')) {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to change settings.' });
    }

    if (chatPermissions && typeof chatPermissions === 'object') {
      Object.assign(group.chatPermissions, chatPermissions);
    }

    await group.save();
    res.json({ status: 'success', data: { chatPermissions: group.chatPermissions } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Approve / Reject Pending Group ──────────────────────────────────────────
exports.approveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'

    if (req.user.role !== 'head') {
      return res.status(403).json({ status: 'error', message: 'Only the Community Head can approve groups.' });
    }

    const group = await Group.findOne({ _id: id, isDeleted: false, approvalStatus: 'pending' });
    if (!group) return res.status(404).json({ status: 'error', message: 'Pending group not found.' });

    group.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    group.approvedBy = req.user._id;
    group.approvedAt = new Date();
    await group.save();

    if (action === 'approve') {
      notifyGroupJoinApproved(group.creator, group._id, group.name);
    }

    res.json({ status: 'success', message: `Group ${action}d.` });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Get Join Requests ────────────────────────────────────────────────────────
exports.getJoinRequests = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findOne({ _id: id, isDeleted: false });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found.' });

    if (!group.canPerform(userId, 'canAddMembers')) {
      return res.status(403).json({ status: 'error', message: 'Not authorized.' });
    }

    const GroupJoinRequest = require('../../models/GroupJoinRequest');
    const requests = await GroupJoinRequest.find({ group: id, status: 'pending' })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ status: 'success', data: requests });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Approve Join Request ─────────────────────────────────────────────────────
exports.approveJoinRequest = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const userId = req.user._id;

    const group = await Group.findOne({ _id: id, isDeleted: false });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found.' });

    if (!group.canPerform(userId, 'canAddMembers')) {
      return res.status(403).json({ status: 'error', message: 'Not authorized.' });
    }

    const GroupJoinRequest = require('../../models/GroupJoinRequest');
    const request = await GroupJoinRequest.findOne({ _id: requestId, group: id, status: 'pending' });
    if (!request) return res.status(404).json({ status: 'error', message: 'Request not found.' });

    request.status = 'approved';
    request.resolvedAt = new Date();
    await request.save();

    if (!group.isMember(request.user)) {
      group.members.push({ userId: request.user, role: 'member', joinedAt: new Date(), addedBy: userId });
      await group.save();

      if (group.conversationId) {
        const { addParticipant } = require('../../services/conversationService');
        await addParticipant(group.conversationId, request.user);
      }

      const { notifyGroupJoinApproved } = require('../../services/notificationService');
      notifyGroupJoinApproved(request.user, group._id, group.name);

      const io = req.app.get('io');
      if (io && group.conversationId) {
        const User = require('../../models/User');
        const user = await User.findById(request.user).select('name avatar');
        if (user) {
          io.to(`conv:${group.conversationId}`).emit('chat:member_added', {
            groupId: group._id,
            user: { _id: user._id, name: user.name, avatar: user.avatar }
          });
        }
      }
    }

    res.json({ status: 'success', message: 'Request approved.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ─── Reject Join Request ──────────────────────────────────────────────────────
exports.rejectJoinRequest = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const userId = req.user._id;

    const group = await Group.findOne({ _id: id, isDeleted: false });
    if (!group) return res.status(404).json({ status: 'error', message: 'Group not found.' });

    if (!group.canPerform(userId, 'canAddMembers')) {
      return res.status(403).json({ status: 'error', message: 'Not authorized.' });
    }

    const GroupJoinRequest = require('../../models/GroupJoinRequest');
    const request = await GroupJoinRequest.findOne({ _id: requestId, group: id, status: 'pending' });
    if (!request) return res.status(404).json({ status: 'error', message: 'Request not found.' });

    request.status = 'rejected';
    request.resolvedAt = new Date();
    await request.save();

    const { notifyGroupJoinRejected } = require('../../services/notificationService');
    notifyGroupJoinRejected(request.user, group.name);

    res.json({ status: 'success', message: 'Request rejected.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
