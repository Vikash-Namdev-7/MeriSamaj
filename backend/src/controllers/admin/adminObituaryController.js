const Obituary = require('../../models/Obituary');
const mongoose = require('mongoose');

// GET /api/v1/admin/obituaries — Get all obituary posts (Global/System-wide view with optional filters)
exports.getAllObituaries = async (req, res) => {
  try {
    const { communityId, ceremonyType, status, search } = req.query;

    let filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (communityId && communityId !== 'all') {
      if (mongoose.Types.ObjectId.isValid(communityId)) {
        filter.communityId = new mongoose.Types.ObjectId(communityId);
      } else {
        filter.$or = [
          { community: new RegExp(communityId, 'i') }
        ];
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { deceasedName: regex },
        { deceasedNameEn: regex },
        { message: regex },
        { community: regex }
      ];
    }

    const obituaries = await Obituary.find(filter)
      .populate('creatorId', 'name avatar role email phone')
      .populate('communityId', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = obituaries.map(ob => {
      const malaArpanCount = Array.isArray(ob.malaArpanUsers)
        ? ob.malaArpanUsers.reduce((sum, item) => sum + (item.count || 0), 0)
        : 0;

      const creator = ob.creatorId || {};
      const comm = ob.communityId || {};

      return {
        id: ob._id,
        _id: ob._id,
        deceasedName: ob.deceasedName,
        deceasedNameEn: ob.deceasedNameEn || '',
        prefix: ob.prefix || '',
        age: ob.age || 0,
        birthDate: ob.birthDate || '',
        dateOfPassing: ob.dateOfPassing,
        funeralDetails: ob.funeralDetails || {},
        ceremonies: ob.ceremonies || [],
        message: ob.message || '',
        image: ob.image || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
        author: {
          id: creator._id || creator.id || null,
          name: creator.name || 'Samaj Member',
          initials: creator.name ? creator.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SM',
          relation: ob.relation || '',
          email: creator.email || '',
          phone: creator.phone || ''
        },
        community: comm.name || ob.community || 'Samaj Member',
        communityId: comm._id || ob.communityId || null,
        haathJodeCount: Array.isArray(ob.haathJodeUsers) ? ob.haathJodeUsers.length : 0,
        shraddhanjaliCount: Array.isArray(ob.haathJodeUsers) ? ob.haathJodeUsers.length : 0,
        malaArpanCount,
        views: ob.views || 0,
        shares: ob.shares || 0,
        saves: Array.isArray(ob.saves) ? ob.saves.length : 0,
        privacy: ob.privacy || 'public',
        familyContact: ob.familyContact || '',
        status: ob.status || 'Approved',
        commentsCount: Array.isArray(ob.comments) ? ob.comments.length : 0,
        createdAt: ob.createdAt || new Date()
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Admin getAllObituaries Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/admin/obituaries/:id — Get single obituary details
exports.getObituaryById = async (req, res) => {
  try {
    const ob = await Obituary.findById(req.params.id)
      .populate('creatorId', 'name avatar role email phone')
      .populate('communityId', 'name code')
      .lean();

    if (!ob) {
      return res.status(404).json({ success: false, message: 'Obituary post not found' });
    }

    res.status(200).json({
      success: true,
      data: ob
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/v1/admin/obituaries/:id/status — Moderation status update (Approved / Pending / Rejected)
exports.updateObituaryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Pending', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value. Must be Approved, Pending, or Rejected' });
    }

    const ob = await Obituary.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!ob) {
      return res.status(404).json({ success: false, message: 'Obituary post not found' });
    }

    res.status(200).json({
      success: true,
      message: `Obituary status updated to ${status}`,
      data: ob
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/admin/obituaries/:id — Delete obituary post
exports.deleteObituary = async (req, res) => {
  try {
    const ob = await Obituary.findByIdAndDelete(req.params.id);
    if (!ob) {
      return res.status(404).json({ success: false, message: 'Obituary post not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Obituary post deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
