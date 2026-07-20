const Obituary = require('../../models/Obituary');

// @desc    Create a new obituary
// @route   POST /api/member/obituaries
// @access  Private
exports.createObituary = async (req, res) => {
  try {
    const {
      prefix,
      deceasedName,
      age,
      birthDate,
      dateOfPassing,
      ritesType,
      ritesDate,
      ritesTime,
      ritesVenue,
      message,
      privacy,
      familyContact,
      relation,
      status
    } = req.body;

    // Validate critical inputs
    if (!deceasedName || !deceasedName.trim()) {
      return res.status(400).json({ message: 'Deceased name is required' });
    }
    if (!dateOfPassing) {
      return res.status(400).json({ message: 'Date of passing is required' });
    }
    if (!ritesDate) {
      return res.status(400).json({ message: 'Ceremony date is required' });
    }
    if (!ritesVenue || !ritesVenue.trim()) {
      return res.status(400).json({ message: 'Ceremony venue is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Condolence message is required' });
    }

    // Get image path from upload middleware (Cloudinary URL is in req.file.path)
    let image = '';
    if (req.file) {
      image = req.file.path;
    }

    const fullName = `${prefix || ''} ${deceasedName}`.trim();

    const obituary = new Obituary({
      deceasedName: fullName,
      deceasedNameEn: deceasedName,
      prefix: prefix || '',
      age: parseInt(age) || 0,
      birthDate: birthDate || '',
      dateOfPassing,
      funeralDetails: {
        type: ritesType || 'Funeral / Last Rites',
        date: ritesDate,
        time: ritesTime || '',
        venue: ritesVenue
      },
      message,
      image,
      creatorId: req.user._id,
      relation: relation || 'Family Member',
      /**
       * communityId is set server-side from req.communityId (ObjectId).
       * community String is also set for backward compatibility during migration.
       * communityId is the authoritative field going forward.
       */
      communityId: req.communityId,
      community: req.user.community || '',
      privacy: privacy || 'public',
      familyContact: familyContact || '',
      status: status || 'Approved'
    });

    const savedObituary = await obituary.save();
    
    // Populate creator info
    const populated = await Obituary.findById(savedObituary._id).populate('creatorId', 'name email avatar initials phone');
    
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating obituary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all obituaries for user's community
// @route   GET /api/member/obituaries
// @access  Private
exports.getObituaries = async (req, res) => {
  try {
    /**
     * Community-scoped query using communityId (ObjectId — primary).
     * Falls back to community String for documents not yet migrated.
     */
    let query;
    if (req.communityId) {
      query = { communityId: req.communityId };
    } else {
      // Fallback: use String field for pre-migration documents
      query = { community: req.user.community };
    }

    // Regular members only see Approved posts and their own submissions
    if (req.user.role !== 'head' && req.user.role !== 'admin') {
      query.$or = [
        { status: 'Approved' },
        { creatorId: req.user._id }
      ];
    }

    const obituaries = await Obituary.find(query)
      .populate('creatorId', 'name email avatar initials phone')
      .sort({ createdAt: -1 });

    res.json(obituaries);
  } catch (error) {
    console.error('Error fetching obituaries:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get obituary by ID
// @route   GET /api/member/obituaries/:id
// @access  Private
exports.getObituaryById = async (req, res) => {
  try {
    const obituary = await Obituary.findById(req.params.id)
      .populate('creatorId', 'name email avatar initials phone');

    if (!obituary) {
      return res.status(404).json({ message: 'Obituary not found' });
    }

    // Community security check — use communityId ObjectId (primary) with string fallback
    const obCommunityId = obituary.communityId?._id ?? obituary.communityId;
    const isOwnCommunity = req.communityId && obCommunityId
      ? obCommunityId.equals(req.communityId)
      : obituary.community === req.user.community; // pre-migration fallback

    if (!isOwnCommunity) {
      return res.status(403).json({ message: 'Unauthorized to view obituaries from other communities' });
    }

    res.json(obituary);
  } catch (error) {
    console.error('Error fetching obituary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update obituary details
// @route   PUT /api/member/obituaries/:id
// @access  Private
exports.updateObituary = async (req, res) => {
  try {
    const obituary = await Obituary.findById(req.params.id);

    if (!obituary) {
      return res.status(404).json({ message: 'Obituary not found' });
    }

    // Verify ownership or community leadership role
    const isCreator = obituary.creatorId.toString() === req.user._id.toString();
    // Use communityId ObjectId check (primary) with string fallback for pre-migration
    const obCommunityId = obituary.communityId?._id ?? obituary.communityId;
    const isSameCommunity = req.communityId && obCommunityId
      ? obCommunityId.equals(req.communityId)
      : obituary.community === req.user.community;
    const isLeadOrAdmin = ['head', 'admin'].includes(req.user.role) && isSameCommunity;

    if (!isCreator && !isLeadOrAdmin) {
      return res.status(401).json({ message: 'Not authorized to update this obituary' });
    }

    const {
      prefix,
      deceasedName,
      age,
      birthDate,
      dateOfPassing,
      ritesType,
      ritesDate,
      ritesTime,
      ritesVenue,
      message,
      privacy,
      familyContact,
      relation,
      existingImage,
      status
    } = req.body;

    let image = existingImage || obituary.image;
    if (req.file) {
      image = req.file.path;
    }

    if (deceasedName && deceasedName.trim()) {
      obituary.deceasedName = `${prefix || obituary.prefix} ${deceasedName}`.trim();
      obituary.deceasedNameEn = deceasedName;
    }

    obituary.prefix = prefix !== undefined ? prefix : obituary.prefix;
    obituary.age = age !== undefined ? parseInt(age) || 0 : obituary.age;
    obituary.birthDate = birthDate !== undefined ? birthDate : obituary.birthDate;
    obituary.dateOfPassing = dateOfPassing || obituary.dateOfPassing;
    
    if (ritesType || ritesDate || ritesVenue) {
      obituary.funeralDetails = {
        type: ritesType || obituary.funeralDetails.type,
        date: ritesDate || obituary.funeralDetails.date,
        time: ritesTime !== undefined ? ritesTime : obituary.funeralDetails.time,
        venue: ritesVenue || obituary.funeralDetails.venue
      };
    }
    
    obituary.message = message || obituary.message;
    obituary.image = image;
    obituary.privacy = privacy || obituary.privacy;
    obituary.familyContact = familyContact !== undefined ? familyContact : obituary.familyContact;
    obituary.relation = relation || obituary.relation;

    if (isLeadOrAdmin && status !== undefined) {
      obituary.status = status;
    }

    const updatedObituary = await obituary.save();
    const populated = await Obituary.findById(updatedObituary._id).populate('creatorId', 'name email avatar initials phone');

    res.json(populated);
  } catch (error) {
    console.error('Error updating obituary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete an obituary
// @route   DELETE /api/member/obituaries/:id
// @access  Private
exports.deleteObituary = async (req, res) => {
  try {
    const obituary = await Obituary.findById(req.params.id);

    if (!obituary) {
      return res.status(404).json({ message: 'Obituary not found' });
    }

    // Verify ownership or community leadership role
    const isCreator = obituary.creatorId.toString() === req.user._id.toString();
    const isLeadOrAdmin = ['head', 'admin'].includes(req.user.role) && obituary.community === req.user.community;

    if (!isCreator && !isLeadOrAdmin) {
      return res.status(401).json({ message: 'Not authorized to delete this obituary' });
    }

    await Obituary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Obituary post deleted successfully' });
  } catch (error) {
    console.error('Error deleting obituary:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle Folded Hands (Haath Jode)
// @route   PUT /api/member/obituaries/:id/haathjode
// @access  Private
exports.toggleHaathJode = async (req, res) => {
  try {
    const obituary = await Obituary.findById(req.params.id);
    if (!obituary) {
      return res.status(404).json({ message: 'Obituary not found' });
    }

    const index = obituary.haathJodeUsers.indexOf(req.user._id);
    if (index >= 0) {
      // Remove folded hand
      obituary.haathJodeUsers.splice(index, 1);
    } else {
      // Add folded hand
      obituary.haathJodeUsers.push(req.user._id);
    }

    await obituary.save();
    res.json({
      haathJodeCount: obituary.haathJodeUsers.length,
      userHasHaathJode: ! (index >= 0)
    });
  } catch (error) {
    console.error('Error toggling haath jode:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Increment Garland offering count (Mala Arpan)
// @route   PUT /api/member/obituaries/:id/malaarpan
// @access  Private
exports.incrementMalaArpan = async (req, res) => {
  try {
    const obituary = await Obituary.findById(req.params.id);
    if (!obituary) {
      return res.status(404).json({ message: 'Obituary not found' });
    }

    const delta = parseInt(req.body.delta) || 1;

    let userGarland = obituary.malaArpanUsers.find(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (userGarland) {
      userGarland.count = Math.max(0, userGarland.count + delta);
    } else {
      obituary.malaArpanUsers.push({
        user: req.user._id,
        count: Math.max(0, delta)
      });
    }

    await obituary.save();

    // Calculate total garland count
    const totalGarlands = obituary.malaArpanUsers.reduce((sum, item) => sum + item.count, 0);

    res.json({
      malaArpanCount: totalGarlands,
      userHasMalaArpan: true
    });
  } catch (error) {
    console.error('Error incrementing mala arpan:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle Save Obituary
// @route   PUT /api/member/obituaries/:id/save
// @access  Private
exports.toggleSave = async (req, res) => {
  try {
    const obituary = await Obituary.findById(req.params.id);
    if (!obituary) {
      return res.status(404).json({ message: 'Obituary not found' });
    }

    const index = obituary.saves.indexOf(req.user._id);
    let isSaved = false;
    if (index >= 0) {
      obituary.saves.splice(index, 1);
    } else {
      obituary.saves.push(req.user._id);
      isSaved = true;
    }

    await obituary.save();
    res.json({
      savesCount: obituary.saves.length,
      isSaved
    });
  } catch (error) {
    console.error('Error toggling save:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Increment Views
// @route   PUT /api/member/obituaries/:id/view
// @access  Private
exports.incrementViews = async (req, res) => {
  try {
    const obituary = await Obituary.findById(req.params.id);
    if (!obituary) {
      return res.status(404).json({ message: 'Obituary not found' });
    }

    obituary.views += 1;
    await obituary.save();

    res.json({ views: obituary.views });
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add Condolence Comment
// @route   POST /api/member/obituaries/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const obituary = await Obituary.findById(req.params.id);
    if (!obituary) {
      return res.status(404).json({ message: 'Obituary not found' });
    }

    // Generate initials
    const name = req.user.name || 'Anonymous';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const newComment = {
      user: req.user._id,
      name,
      initials,
      text: text.trim(),
      likes: [],
      timestamp: new Date()
    };

    obituary.comments.push(newComment);
    await obituary.save();

    res.status(201).json(obituary.comments);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle Comment Like
// @route   PUT /api/member/obituaries/:id/comments/:commentId/like
// @access  Private
exports.toggleCommentLike = async (req, res) => {
  try {
    const obituary = await Obituary.findById(req.params.id);
    if (!obituary) {
      return res.status(404).json({ message: 'Obituary not found' });
    }

    const comment = obituary.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const index = comment.likes.indexOf(req.user._id);
    let isLiked = false;
    if (index >= 0) {
      comment.likes.splice(index, 1);
    } else {
      comment.likes.push(req.user._id);
      isLiked = true;
    }

    await obituary.save();
    res.json(obituary.comments);
  } catch (error) {
    console.error('Error toggling comment like:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update Obituary status (Approve/Reject)
// @route   PUT /api/member/obituaries/:id/status
// @access  Private (Head/Admin only)
exports.updateObituaryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const obituary = await Obituary.findById(req.params.id);
    if (!obituary) {
      return res.status(404).json({ message: 'Obituary not found' });
    }

    // Community security check
    if (obituary.community !== req.user.community) {
      return res.status(403).json({ message: 'Unauthorized to manage obituaries from other communities' });
    }

    // Verify user is head/admin
    if (req.user.role !== 'head' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only Samaj Head or Admin can update moderation status' });
    }

    obituary.status = status;
    const saved = await obituary.save();
    const populated = await Obituary.findById(saved._id).populate('creatorId', 'name email avatar initials phone');
    
    res.json(populated);
  } catch (error) {
    console.error('Error updating obituary status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
