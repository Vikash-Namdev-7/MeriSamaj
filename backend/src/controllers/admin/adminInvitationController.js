const Invitation = require('../../models/Invitation');
const mongoose = require('mongoose');
const { applyScopeFilter } = require('../../utils/queryScopeHelper');

// GET /api/v1/admin/invitations — Platform-wide list of invitations with filters
exports.getAllInvitations = async (req, res) => {
  try {
    const { status, search } = req.query;

    const baseFilter = {};
    if (status && status !== 'all' && status !== 'All') {
      baseFilter.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      baseFilter.$or = [
        { title: regex },
        { hostName: regex },
        { location: regex },
        { contact: regex }
      ];
    }

    // Apply centralized scope filter (Admin role gets global access by default, optional communityId/city query params)
    const filter = applyScopeFilter(req, baseFilter);

    const invitations = await Invitation.find(filter)
      .populate('creatorId', 'name avatar role email phone')
      .populate('communityId', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = invitations.map(inv => {
      const creator = inv.creatorId || {};
      const comm = inv.communityId || {};
      const rsvps = Array.isArray(inv.rsvps) ? inv.rsvps : [];

      const attendingCount = rsvps.filter(r => r.status === 'attending' || r.status === 'attending_family').length;
      const notAttendingCount = rsvps.filter(r => r.status === 'not_attending').length;
      const pendingRsvpCount = rsvps.filter(r => r.status === 'pending').length;

      return {
        id: inv._id,
        _id: inv._id,
        title: inv.title,
        hostName: inv.hostName,
        date: inv.date,
        timeFood: inv.timeFood || '',
        timeProgram: inv.timeProgram || '',
        location: inv.location,
        mapLink: inv.mapLink || '',
        contact: inv.contact,
        message: inv.message || '',
        images: inv.images || [],
        creator: {
          id: creator._id || creator.id || null,
          name: creator.name || 'Samaj Member',
          initials: creator.name ? creator.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SM',
          email: creator.email || '',
          phone: creator.phone || ''
        },
        community: comm.name || 'Samaj Member',
        communityId: comm._id || inv.communityId || null,
        status: inv.status || 'Approved',
        rsvpsCount: rsvps.length,
        attendingCount,
        notAttendingCount,
        pendingRsvpCount,
        invitedMembersCount: Array.isArray(inv.invitedMemberIds) ? inv.invitedMemberIds.length : 0,
        createdAt: inv.createdAt || new Date()
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Admin getAllInvitations Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/admin/invitations/stats — Overall platform metrics for invitations
exports.getInvitationStats = async (req, res) => {
  try {
    const filter = applyScopeFilter(req, {});

    const invitations = await Invitation.find(filter).lean();

    const totalInvitations = invitations.length;
    const pendingApproval = invitations.filter(i => i.status === 'Pending').length;
    const approvedCount = invitations.filter(i => i.status === 'Approved').length;
    const rejectedCount = invitations.filter(i => i.status === 'Rejected').length;

    let totalRsvps = 0;
    let totalAttending = 0;

    invitations.forEach(i => {
      if (Array.isArray(i.rsvps)) {
        totalRsvps += i.rsvps.length;
        totalAttending += i.rsvps.filter(r => r.status === 'attending' || r.status === 'attending_family').length;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalInvitations,
        pendingApproval,
        approvedCount,
        rejectedCount,
        totalRsvps,
        totalAttending
      }
    });
  } catch (error) {
    console.error('Admin getInvitationStats Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/admin/invitations/:id — Get single invitation details
exports.getInvitationById = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id)
      .populate('creatorId', 'name avatar role email phone')
      .populate('communityId', 'name code')
      .populate('rsvps.memberId', 'name avatar phone')
      .lean();

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Digital Invitation not found' });
    }

    res.status(200).json({
      success: true,
      data: invitation
    });
  } catch (error) {
    console.error('Admin getInvitationById Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/v1/admin/invitations/:id/status — Moderation status update ('Pending', 'Approved', 'Rejected')
exports.updateInvitationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Approved', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status value. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const invitation = await Invitation.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Digital Invitation not found' });
    }

    res.status(200).json({
      success: true,
      message: `Invitation status updated to ${status}`,
      data: invitation
    });
  } catch (error) {
    console.error('Admin updateInvitationStatus Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/admin/invitations/:id — Moderation deletion
exports.deleteInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findByIdAndDelete(req.params.id);
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Digital Invitation not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Invitation deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('Admin deleteInvitation Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
