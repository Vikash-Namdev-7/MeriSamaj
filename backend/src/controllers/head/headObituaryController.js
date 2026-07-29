const Obituary = require('../../models/Obituary');
const mongoose = require('mongoose');
const { applyScopeFilter } = require('../../utils/queryScopeHelper');

// GET /api/v1/head/obituaries — Head community obituaries list with filters
exports.getAllObituaries = async (req, res) => {
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
        { deceasedName: regex },
        { deceasedNameEn: regex },
        { message: regex }
      ];
    }

    // Apply centralized scope filter (Head role mandatory communityId scope)
    const filter = applyScopeFilter(req, baseFilter);

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
      status: 'success',
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Head getAllObituaries Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/v1/head/obituaries/stats — Community-scoped obituary metrics
exports.getObituaryStats = async (req, res) => {
  try {
    const filter = applyScopeFilter(req, {});
    const obituaries = await Obituary.find(filter).lean();

    const totalObituaries = obituaries.length;
    const pendingApproval = obituaries.filter(o => o.status === 'Pending').length;
    const approvedCount = obituaries.filter(o => o.status === 'Approved').length;
    const rejectedCount = obituaries.filter(o => o.status === 'Rejected').length;

    res.status(200).json({
      status: 'success',
      data: {
        totalObituaries,
        pendingApproval,
        approvedCount,
        rejectedCount
      }
    });
  } catch (error) {
    console.error('Head getObituaryStats Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// GET /api/v1/head/obituaries/:id — Single obituary details scoped to community
exports.getObituaryById = async (req, res) => {
  try {
    const filter = applyScopeFilter(req, { _id: req.params.id });
    const obituary = await Obituary.findOne(filter)
      .populate('creatorId', 'name avatar role email phone')
      .populate('communityId', 'name code')
      .lean();

    if (!obituary) {
      return res.status(404).json({ status: 'fail', message: 'Obituary notice not found or not in your community' });
    }

    res.status(200).json({
      status: 'success',
      data: obituary
    });
  } catch (error) {
    console.error('Head getObituaryById Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// PATCH /api/v1/head/obituaries/:id/status — Moderation status update ('Pending', 'Approved', 'Rejected')
exports.updateObituaryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Approved', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: `Invalid status value. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const filter = applyScopeFilter(req, { _id: req.params.id });
    const obituary = await Obituary.findOneAndUpdate(
      filter,
      { $set: { status } },
      { new: true }
    );

    if (!obituary) {
      return res.status(404).json({ status: 'fail', message: 'Obituary notice not found or not in your community' });
    }

    res.status(200).json({
      status: 'success',
      message: `Obituary status updated to ${status}`,
      data: obituary
    });
  } catch (error) {
    console.error('Head updateObituaryStatus Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// DELETE /api/v1/head/obituaries/:id — Delete obituary scoped to community
exports.deleteObituary = async (req, res) => {
  try {
    const filter = applyScopeFilter(req, { _id: req.params.id });
    const obituary = await Obituary.findOneAndDelete(filter);

    if (!obituary) {
      return res.status(404).json({ status: 'fail', message: 'Obituary notice not found or not in your community' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Obituary deleted successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('Head deleteObituary Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
