const Invitation = require('../../models/Invitation');
const { notifyInvitationReceived } = require('../../services/notificationService');

// @desc    Create a new invitation
// @route   POST /api/member/invitations
// @access  Private
exports.createInvitation = async (req, res) => {
  try {
    const {
      title,
      hostName,
      date,
      timeFood,
      timeProgram,
      location,
      mapLink,
      contact,
      message,
      invitedMemberIds,
      invitedGroupIds,
      groomName,
      brideName,
      familyName,
      customFields
    } = req.body;

    // Handle uploaded images from Cloudinary
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path); // Cloudinary URL is in file.path
    }

    // Parse array fields if they are sent as strings
    let parsedMemberIds = [];
    let parsedGroupIds = [];
    try {
      if (invitedMemberIds) {
        parsedMemberIds = typeof invitedMemberIds === 'string' ? JSON.parse(invitedMemberIds) : invitedMemberIds;
      }
      if (invitedGroupIds) {
        parsedGroupIds = typeof invitedGroupIds === 'string' ? JSON.parse(invitedGroupIds) : invitedGroupIds;
      }
    } catch (e) {
      console.error('Error parsing member/group IDs:', e);
    }

    let parsedCustomFields = {};
    try {
      if (customFields) {
        parsedCustomFields = typeof customFields === 'string' ? JSON.parse(customFields) : customFields;
      }
    } catch (e) {
      console.error('Error parsing customFields:', e);
    }

    const invitation = new Invitation({
      title,
      hostName,
      date,
      timeFood,
      timeProgram,
      location,
      mapLink,
      contact,
      message,
      images,
      creatorId: req.user._id,
      /**
       * communityId is ALWAYS set server-side from the authenticated user's community.
       * Client body.communityId is intentionally ignored for security.
       */
      communityId: req.communityId,
      invitedMemberIds: parsedMemberIds,
      invitedGroupIds: parsedGroupIds,
      groomName,
      brideName,
      familyName,
      customFields: parsedCustomFields
    });

    const createdInvitation = await invitation.save();

    // ── Notification: notify invited members ──────────────────────────────────────
    try {
      if (parsedMemberIds && parsedMemberIds.length > 0) {
        notifyInvitationReceived(parsedMemberIds, hostName || req.user.name || 'A member', title, createdInvitation._id);
      }
    } catch (notifErr) {
      console.warn('[Notify] createInvitation invitation_received failed:', notifErr.message);
    }

    res.status(201).json(createdInvitation);
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all invitations for the logged-in user's community
// @route   GET /api/member/invitations
// @access  Private
exports.getInvitations = async (req, res) => {
  try {
    /**
     * Community-scoped query: only return invitations belonging to the
     * same community as the authenticated user. req.communityId is set
     * by authMiddleware from the user's communityId field.
     */
    const filter = {};
    if (req.communityId) {
      filter.communityId = req.communityId;
    }

    const invitations = await Invitation.find(filter)
      .populate('creatorId', 'name email')
      .populate('rsvps.memberId', 'name')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get invitation by ID
// @route   GET /api/member/invitations/:id
// @access  Private
exports.getInvitationById = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id)
      .populate('creatorId', 'name email')
      .populate('rsvps.memberId', 'name');

    if (invitation) {
      res.json(invitation);
    } else {
      res.status(404).json({ message: 'Invitation not found' });
    }
  } catch (error) {
    console.error('Error fetching invitation:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update RSVP status
// @route   PUT /api/member/invitations/:id/rsvp
// @access  Private
exports.updateRSVP = async (req, res) => {
  try {
    const { status } = req.body;
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    const rsvpIndex = invitation.rsvps.findIndex(
      (r) => r.memberId.toString() === req.user._id.toString()
    );

    if (rsvpIndex >= 0) {
      // Update existing RSVP
      invitation.rsvps[rsvpIndex].status = status;
    } else {
      // Add new RSVP
      invitation.rsvps.push({ memberId: req.user._id, status });
    }

    await invitation.save();
    res.json(invitation);
  } catch (error) {
    console.error('Error updating RSVP:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete invitation
// @route   DELETE /api/member/invitations/:id
// @access  Private
exports.deleteInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if the user is authorized (creator, head, or admin)
    const isCreator = invitation.creatorId && invitation.creatorId.toString() === req.user._id.toString();
    const isHeadOrAdmin = ['head', 'admin', 'head_admin', 'super_admin', 'master_admin'].includes(req.user.role);

    if (!isCreator && !isHeadOrAdmin) {
      return res.status(401).json({ message: 'Not authorized to delete this invitation' });
    }

    await Invitation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invitation removed' });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update an invitation
// @route   PUT /api/member/invitations/:id
// @access  Private
exports.updateInvitation = async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if the user is authorized (creator, head, or admin)
    if (invitation.creatorId.toString() !== req.user._id.toString() && !['head', 'admin'].includes(req.user.role)) {
      return res.status(401).json({ message: 'Not authorized to update this invitation' });
    }

    const {
      title,
      hostName,
      date,
      timeFood,
      timeProgram,
      location,
      mapLink,
      contact,
      message,
      invitedMemberIds,
      invitedGroupIds,
      groomName,
      brideName,
      familyName,
      status,
      existingImages,
      customFields
    } = req.body;

    // Handle existing images
    let images = [];
    if (existingImages) {
      try {
        images = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
      } catch (e) {
        console.error('Error parsing existingImages:', e);
        images = invitation.images || [];
      }
    } else {
      images = invitation.images || [];
    }

    // Handle newly uploaded images from Cloudinary
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      images = [...images, ...newImages];
    }

    // Parse array fields if they are sent as strings
    let parsedMemberIds = invitation.invitedMemberIds;
    let parsedGroupIds = invitation.invitedGroupIds;
    try {
      if (invitedMemberIds) {
        parsedMemberIds = typeof invitedMemberIds === 'string' ? JSON.parse(invitedMemberIds) : invitedMemberIds;
      }
      if (invitedGroupIds) {
        parsedGroupIds = typeof invitedGroupIds === 'string' ? JSON.parse(invitedGroupIds) : invitedGroupIds;
      }
    } catch (e) {
      console.error('Error parsing member/group IDs:', e);
    }

    let parsedCustomFields = invitation.customFields || {};
    try {
      if (customFields) {
        parsedCustomFields = typeof customFields === 'string' ? JSON.parse(customFields) : customFields;
      }
    } catch (e) {
      console.error('Error parsing customFields:', e);
    }

    invitation.title = title || invitation.title;
    invitation.hostName = hostName || invitation.hostName;
    invitation.date = date || invitation.date;
    invitation.timeFood = timeFood !== undefined ? timeFood : invitation.timeFood;
    invitation.timeProgram = timeProgram !== undefined ? timeProgram : invitation.timeProgram;
    invitation.location = location || invitation.location;
    invitation.mapLink = mapLink !== undefined ? mapLink : invitation.mapLink;
    invitation.contact = contact || invitation.contact;
    invitation.message = message !== undefined ? message : invitation.message;
    invitation.images = images;
    invitation.invitedMemberIds = parsedMemberIds;
    invitation.invitedGroupIds = parsedGroupIds;
    invitation.groomName = groomName || invitation.groomName;
    invitation.brideName = brideName || invitation.brideName;
    invitation.familyName = familyName || invitation.familyName;
    invitation.status = status || invitation.status;
    
    if (customFields) {
      invitation.customFields = parsedCustomFields;
      invitation.markModified('customFields');
    }

    const updated = await invitation.save();
    res.json(updated);
  } catch (error) {
    console.error('Error updating invitation:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
