const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const { applyScopeFilter } = require('../utils/queryScopeHelper');

const resolveTargeting = (body) => {
  const { targetScope, isGlobalCampaign, targetedCommunities, visibility } = body;

  let isGlobal = false;
  let targetCommunities = [];
  let finalVisibility = visibility || 'All Members';

  if (targetScope === 'All Communities' || targetScope === 'All Communities / All Members' || isGlobalCampaign === true || isGlobalCampaign === 'true') {
    isGlobal = true;
    targetCommunities = [];
    finalVisibility = 'All Members';
  } else if (targetScope === 'Selected Communities' || (Array.isArray(targetedCommunities) && targetedCommunities.length > 0)) {
    isGlobal = false;
    finalVisibility = 'Selected Communities';
    if (Array.isArray(targetedCommunities)) {
      targetCommunities = targetedCommunities
        .filter(id => id && mongoose.Types.ObjectId.isValid(id.toString()))
        .map(id => new mongoose.Types.ObjectId(id.toString()));
    }
  }

  return {
    isGlobalCampaign: isGlobal,
    targetedCommunities: targetCommunities,
    visibility: finalVisibility
  };
};

// GET /admin/donations — List all donations & campaigns (Admin global view with optional status, category, communityId filters)
exports.getAllDonations = async (req, res) => {
  try {
    const { includeDeleted, status, category, communityId } = req.query;

    let baseFilter = {};
    if (includeDeleted !== 'true') {
      baseFilter.isDeleted = { $ne: true };
    }

    if (status && status !== 'all') {
      if (status === 'Active') {
        baseFilter.status = { $in: ['Active', 'Published'] };
      } else {
        baseFilter.status = status;
      }
    }

    if (category && category !== 'all') {
      baseFilter.category = category;
    }

    // Community filter logic:
    // 'all' -> return everything
    // 'global' -> return only global campaigns
    // specific communityId -> return campaigns where communityId matches OR targetedCommunities includes communityId
    if (communityId && communityId !== 'all') {
      if (communityId === 'global') {
        baseFilter.$or = [
          { isGlobalCampaign: true },
          { visibility: 'All Members' }
        ];
      } else if (mongoose.Types.ObjectId.isValid(communityId)) {
        const commObjId = new mongoose.Types.ObjectId(communityId);
        baseFilter.$or = [
          { communityId: commObjId },
          { targetedCommunities: commObjId }
        ];
      }
    }

    const [donationDocs, campaignDocs] = await Promise.all([
      Donation.find(baseFilter)
        .populate('targetedCommunities', 'name code')
        .populate('communityId', 'name code')
        .lean()
        .catch(() => []),
      Campaign.find(baseFilter)
        .populate('targetedCommunities', 'name code')
        .populate('communityId', 'name code')
        .lean()
        .catch(() => [])
    ]);

    // Normalize Donation docs with explicit source: "donation"
    const normalizedDonations = donationDocs.map(d => ({
      _id: d._id,
      id: d._id,
      source: 'donation',
      title: d.title || '',
      shortDescription: d.description || '',
      description: d.description || '',
      targetAmount: d.targetAmount || 0,
      raisedAmount: d.raisedAmount || 0,
      donorCount: d.donorCount || (Array.isArray(d.recentDonations) ? d.recentDonations.length : 0),
      category: d.category || 'General',
      status: d.status || 'Active',
      city: d.city || '',
      communityId: d.communityId || null,
      targetedCommunities: d.targetedCommunities || [],
      isGlobalCampaign: d.isGlobalCampaign || d.visibility === 'All Members',
      visibility: d.visibility || (d.isGlobalCampaign ? 'All Members' : 'Selected Communities'),
      coverImage: d.coverImage || '',
      bannerImage: d.coverImage || '',
      createdAt: d.createdAt || new Date(),
      updatedAt: d.updatedAt || new Date()
    }));

    // Normalize Campaign docs (Head-created) with explicit source: "campaign"
    const normalizedCampaigns = campaignDocs.map(c => ({
      _id: c._id,
      id: c._id,
      source: 'campaign',
      title: c.title || '',
      shortDescription: c.shortDescription || c.description || '',
      description: c.description || c.shortDescription || '',
      targetAmount: c.targetAmount || 0,
      raisedAmount: c.collectedAmount || c.raisedAmount || 0,
      donorCount: c.contributorsCount || c.donorCount || 0,
      category: c.category || 'General',
      status: c.status === 'Published' ? 'Active' : (c.status || 'Active'),
      city: c.city || '',
      communityId: c.communityId || null,
      targetedCommunities: c.targetedCommunities || [],
      isGlobalCampaign: c.isGlobalCampaign || c.visibility === 'All Members',
      visibility: c.visibility || (c.isGlobalCampaign ? 'All Members' : 'Entire Community'),
      coverImage: c.bannerImage || '',
      bannerImage: c.bannerImage || '',
      createdAt: c.createdAt || new Date(),
      updatedAt: c.updatedAt || new Date()
    }));

    // Combine & sort by createdAt descending
    const combined = [...normalizedDonations, ...normalizedCampaigns].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({
      success: true,
      data: combined
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /admin/donations — Create new donation campaign (Admin source)
exports.createDonation = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      description,
      targetAmount,
      minDonation,
      category,
      priority,
      city,
      startDate,
      endDate,
      coverImage,
      bannerImage,
      status
    } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({ success: false, message: 'Title and target amount are required' });
    }

    const { isGlobalCampaign, targetedCommunities, visibility } = resolveTargeting(req.body);
    const imgUrl = coverImage || bannerImage || '';

    const donation = new Donation({
      txnId: `CAMP_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      title,
      shortDescription: shortDescription || '',
      description: description || '',
      targetAmount: Number(targetAmount),
      minDonation: minDonation ? Number(minDonation) : 1,
      category: category || 'General',
      priority: priority || 'Medium',
      city: city || '',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      coverImage: imgUrl,
      status: status || 'Active',
      isGlobalCampaign,
      targetedCommunities,
      visibility,
      raisedAmount: 0,
      donorCount: 0,
      recentDonations: []
    });

    try {
      await donation.save();
    } catch (saveErr) {
      if (saveErr.code === 11000 && saveErr.message?.includes('txnId')) {
        try {
          await Donation.collection.dropIndex('txnId_1');
          await donation.save();
        } catch (retryErr) {
          throw saveErr;
        }
      } else {
        throw saveErr;
      }
    }

    const populatedDonation = await Donation.findById(donation._id)
      .populate('targetedCommunities', 'name code')
      .populate('communityId', 'name code');

    const resultData = populatedDonation.toObject();
    resultData.source = 'donation';

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: resultData
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /admin/donations/:id — Update donation fields (source-aware)
exports.updateDonation = async (req, res) => {
  try {
    const source = req.body.source || req.query.source;
    const { isGlobalCampaign, targetedCommunities, visibility } = resolveTargeting(req.body);

    const updatePayload = {
      ...req.body,
      isGlobalCampaign,
      targetedCommunities,
      visibility
    };

    if (req.body.coverImage || req.body.bannerImage) {
      const img = req.body.coverImage || req.body.bannerImage;
      updatePayload.coverImage = img;
      updatePayload.bannerImage = img;
    }

    delete updatePayload.source;
    delete updatePayload.targetScope;
    delete updatePayload.raisedAmount;
    delete updatePayload.collectedAmount;
    delete updatePayload.donorCount;
    delete updatePayload.contributorsCount;
    delete updatePayload.recentDonations;
    delete updatePayload.isDeleted;

    let doc = null;

    if (source === 'campaign') {
      doc = await Campaign.findOneAndUpdate(
        { _id: req.params.id, isDeleted: { $ne: true } },
        { $set: updatePayload },
        { new: true, runValidators: true }
      ).populate('targetedCommunities', 'name code').populate('communityId', 'name code');
    } else if (source === 'donation') {
      doc = await Donation.findOneAndUpdate(
        { _id: req.params.id, isDeleted: { $ne: true } },
        { $set: updatePayload },
        { new: true, runValidators: true }
      ).populate('targetedCommunities', 'name code').populate('communityId', 'name code');
    } else {
      // Fallback: try Donation first, then Campaign
      doc = await Donation.findOneAndUpdate(
        { _id: req.params.id, isDeleted: { $ne: true } },
        { $set: updatePayload },
        { new: true, runValidators: true }
      ).populate('targetedCommunities', 'name code').populate('communityId', 'name code');

      if (!doc) {
        doc = await Campaign.findOneAndUpdate(
          { _id: req.params.id, isDeleted: { $ne: true } },
          { $set: updatePayload },
          { new: true, runValidators: true }
        ).populate('targetedCommunities', 'name code').populate('communityId', 'name code');
      }
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Donation or Campaign record not found' });
    }

    const resObj = doc.toObject();
    resObj.source = source || (doc instanceof Campaign ? 'campaign' : 'donation');

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      data: resObj
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PATCH /admin/donations/:id/close — Close donation drive (source-aware)
exports.closeDonation = async (req, res) => {
  try {
    const source = req.body?.source || req.query?.source;
    let doc = null;

    if (source === 'campaign') {
      doc = await Campaign.findOneAndUpdate(
        { _id: req.params.id, isDeleted: { $ne: true } },
        { $set: { status: 'Closed' } },
        { new: true }
      ).populate('targetedCommunities', 'name code').populate('communityId', 'name code');
    } else if (source === 'donation') {
      doc = await Donation.findOneAndUpdate(
        { _id: req.params.id, isDeleted: { $ne: true } },
        { $set: { status: 'Closed' } },
        { new: true }
      ).populate('targetedCommunities', 'name code').populate('communityId', 'name code');
    } else {
      doc = await Donation.findOneAndUpdate(
        { _id: req.params.id, isDeleted: { $ne: true } },
        { $set: { status: 'Closed' } },
        { new: true }
      ).populate('targetedCommunities', 'name code').populate('communityId', 'name code');

      if (!doc) {
        doc = await Campaign.findOneAndUpdate(
          { _id: req.params.id, isDeleted: { $ne: true } },
          { $set: { status: 'Closed' } },
          { new: true }
        ).populate('targetedCommunities', 'name code').populate('communityId', 'name code');
      }
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Donation or Campaign record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Donation drive closed successfully',
      data: doc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /admin/donations/:id — Soft delete donation or campaign (source-aware)
exports.deleteDonation = async (req, res) => {
  try {
    const source = req.query?.source || req.body?.source;
    let doc = null;

    if (source === 'campaign') {
      doc = await Campaign.findByIdAndUpdate(
        req.params.id,
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true }
      );
    } else if (source === 'donation') {
      doc = await Donation.findByIdAndUpdate(
        req.params.id,
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true }
      );
    } else {
      doc = await Donation.findByIdAndUpdate(
        req.params.id,
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true }
      );

      if (!doc) {
        doc = await Campaign.findByIdAndUpdate(
          req.params.id,
          { $set: { isDeleted: true, deletedAt: new Date() } },
          { new: true }
        );
      }
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Donation or Campaign record not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully',
      data: doc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

