const Professional = require('../../models/Professional');
const User = require('../../models/User');

// Helper to resolve Head's community ID
const getCommunityId = (req) => {
  let communityId = req.communityId || req.user?.communityId;
  if (communityId) return communityId;
  if (req.user?.assignedCommunityIds && req.user.assignedCommunityIds.length > 0) {
    return req.user.assignedCommunityIds[0];
  }
  return null;
};

// 1. Get filter options dynamically scoped to Head's community
exports.getFilterOptions = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    if (!communityId) {
      return res.status(403).json({ success: false, message: 'Access Denied. No community assigned.' });
    }

    const categories = await Professional.distinct('category', { communityId });
    const cities = await Professional.distinct('city', { communityId });

    res.status(200).json({
      success: true,
      data: {
        categories: categories.filter(Boolean),
        cities: cities.filter(Boolean),
        statuses: ['Pending', 'Approved', 'Rejected', 'Suspended'],
        credentialStatuses: ['PENDING', 'VERIFIED', 'REJECTED']
      }
    });
  } catch (error) {
    console.error('head getFilterOptions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 2. Get all listings with filters, pagination, and dynamic statistics scoped to community
exports.getListings = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    if (!communityId) {
      return res.status(403).json({ success: false, message: 'Access Denied. No community assigned.' });
    }

    const { search, status, category, city, credentialStatus, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = { communityId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (city) filter.city = { $regex: new RegExp(`^${city}$`, 'i') };
    if (credentialStatus) filter.credentialVerificationStatus = credentialStatus;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { companyName: searchRegex },
        { profession: searchRegex },
        { category: searchRegex },
        { city: searchRegex },
        { workAddress: searchRegex },
        { about: searchRegex }
      ];
    }

    const skipIndex = (page - 1) * limit;

    // Apply sorting rules
    let sortOptions = {};
    if (sortBy === 'companyName') {
      sortOptions.companyName = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const listings = await Professional.find(filter)
      .populate('ownerId', 'name email phone avatar')
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(skipIndex);

    const totalDocs = await Professional.countDocuments(filter);

    // Dynamic Statistics calculation scoped strictly to communityId
    const total = await Professional.countDocuments({ communityId });
    const pending = await Professional.countDocuments({ communityId, status: 'Pending' });
    const approved = await Professional.countDocuments({ communityId, status: 'Approved' });
    const rejected = await Professional.countDocuments({ communityId, status: 'Rejected' });
    const suspended = await Professional.countDocuments({ communityId, status: 'Suspended' });
    const verified = await Professional.countDocuments({ communityId, credentialVerificationStatus: 'VERIFIED' });
    const verificationPending = await Professional.countDocuments({ communityId, credentialVerificationStatus: 'PENDING' });

    const formatted = listings.map(p => ({
      id: p._id.toString(),
      title: p.companyName,
      category: p.category,
      categoryKey: p.categoryKey,
      profession: p.profession,
      city: p.city,
      rating: p.rating || 5.0,
      initials: p.initials || p.companyName.substring(0, 2).toUpperCase(),
      phone: p.phone || (p.ownerId ? p.ownerId.phone : ''),
      verified: p.status === 'Approved',
      description: p.about,
      experience: p.yearsOfExperience,
      address: p.workAddress,
      businessTiming: p.businessTiming || '09:00 AM - 08:00 PM',
      owner: p.ownerId ? { name: p.ownerId.name, email: p.ownerId.email, phone: p.ownerId.phone } : null,
      status: p.status,
      credentialVerificationStatus: p.credentialVerificationStatus,
      media: p.media || [],
      createdDate: p.createdAt
    }));

    res.status(200).json({
      success: true,
      data: {
        listings: formatted,
        pagination: {
          total: totalDocs,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(totalDocs / limit)
        },
        statistics: {
          total,
          pending,
          approved,
          rejected,
          suspended,
          verified,
          verificationPending
        }
      }
    });
  } catch (error) {
    console.error('head getListings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 3. Get single listing detail scoped to community
exports.getListingById = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    if (!communityId) {
      return res.status(403).json({ success: false, message: 'Access Denied. No community assigned.' });
    }

    const p = await Professional.findById(req.params.id)
      .populate('ownerId', 'name email phone avatar')
      .populate('communityId', 'name')
      .populate('approval.approvedBy.userId', 'name')
      .populate('approval.rejectedBy.userId', 'name')
      .populate('verifiedBy', 'name');

    if (!p) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    // Verify community access boundaries
    if (p.communityId._id.toString() !== communityId.toString()) {
      return res.status(403).json({ success: false, message: 'Access Denied. Cannot view listing from another community.' });
    }

    const data = {
      id: p._id.toString(),
      title: p.companyName,
      category: p.category,
      categoryKey: p.categoryKey,
      profession: p.profession,
      city: p.city,
      rating: p.rating || 5.0,
      initials: p.initials || p.companyName.substring(0, 2).toUpperCase(),
      phone: p.phone || (p.ownerId ? p.ownerId.phone : ''),
      verified: p.status === 'Approved',
      description: p.about,
      experience: p.yearsOfExperience,
      address: p.workAddress,
      businessTiming: p.businessTiming || '09:00 AM - 08:00 PM',
      owner: p.ownerId ? { name: p.ownerId.name, email: p.ownerId.email, phone: p.ownerId.phone } : null,
      community: p.communityId ? p.communityId.name : 'Unknown Community',
      status: p.status,
      credentialVerificationStatus: p.credentialVerificationStatus,
      approval: {
        approvedBy: p.approval?.approvedBy?.userId ? { name: p.approval.approvedBy.userId.name, role: p.approval.approvedBy.role } : null,
        approvedAt: p.approval?.approvedAt,
        rejectedBy: p.approval?.rejectedBy?.userId ? { name: p.approval.rejectedBy.userId.name, role: p.approval.rejectedBy.role } : null,
        rejectedAt: p.approval?.rejectedAt,
        rejectionReason: p.approval?.rejectionReason
      },
      verification: {
        verifiedBy: p.verifiedBy ? p.verifiedBy.name : null,
        verifiedAt: p.verifiedAt,
        note: p.verificationNote
      },
      media: p.media || [],
      createdDate: p.createdAt
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('head getListingById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 4. Approve listing belonging to Head's community (atomic transition)
exports.approveListing = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    if (!communityId) {
      return res.status(403).json({ success: false, message: 'Access Denied. No community assigned.' });
    }

    const listing = await Professional.findOne({ _id: req.params.id });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.communityId.toString() !== communityId.toString()) {
      return res.status(403).json({ success: false, message: 'Access Denied. Cannot approve listing of another community.' });
    }

    // Atomic update
    const updated = await Professional.findOneAndUpdate(
      { _id: req.params.id, communityId, status: 'Pending' },
      {
        $set: {
          status: 'Approved',
          approval: {
            approvedBy: { userId: req.user._id, role: 'HEAD' },
            approvedAt: new Date(),
            rejectedBy: null,
            rejectedAt: null,
            rejectionReason: null
          }
        }
      },
      { new: true }
    );

    if (!updated) {
      const current = await Professional.findById(req.params.id);
      return res.status(200).json({ 
        success: true, 
        message: `Listing is already actioned. Current status: ${current.status}`,
        data: current 
      });
    }

    res.status(200).json({ success: true, message: 'Listing approved successfully.', data: updated });
  } catch (error) {
    console.error('head approveListing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 5. Reject listing belonging to Head's community
exports.rejectListing = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    if (!communityId) {
      return res.status(403).json({ success: false, message: 'Access Denied. No community assigned.' });
    }

    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    const listing = await Professional.findOne({ _id: req.params.id });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.communityId.toString() !== communityId.toString()) {
      return res.status(403).json({ success: false, message: 'Access Denied. Cannot reject listing of another community.' });
    }

    // Atomic update
    const updated = await Professional.findOneAndUpdate(
      { _id: req.params.id, communityId, status: 'Pending' },
      {
        $set: {
          status: 'Rejected',
          approval: {
            rejectedBy: { userId: req.user._id, role: 'HEAD' },
            rejectedAt: new Date(),
            rejectionReason: reason,
            approvedBy: null,
            approvedAt: null
          }
        }
      },
      { new: true }
    );

    if (!updated) {
      const current = await Professional.findById(req.params.id);
      return res.status(400).json({ 
        success: false, 
        message: `Unable to reject. Listing state is already ${current.status}.` 
      });
    }

    res.status(200).json({ success: true, message: 'Listing rejected successfully.', data: updated });
  } catch (error) {
    console.error('head rejectListing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 6. Verify credentials scoped to Head's community
exports.verifyCredentials = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    if (!communityId) {
      return res.status(403).json({ success: false, message: 'Access Denied. No community assigned.' });
    }

    const { status, note } = req.body;
    if (!status || !['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid verification status is required.' });
    }

    const listing = await Professional.findOne({ _id: req.params.id });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.communityId.toString() !== communityId.toString()) {
      return res.status(403).json({ success: false, message: 'Access Denied. Cannot verify listing of another community.' });
    }

    const updated = await Professional.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          credentialVerificationStatus: status,
          verifiedBy: req.user._id,
          verifiedAt: new Date(),
          verificationNote: note || ''
        }
      },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Credentials updated successfully.', data: updated });
  } catch (error) {
    console.error('head verifyCredentials error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 7. Suspend listing scoped to Head's community
exports.suspendListing = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    if (!communityId) {
      return res.status(403).json({ success: false, message: 'Access Denied. No community assigned.' });
    }

    const listing = await Professional.findOne({ _id: req.params.id });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.communityId.toString() !== communityId.toString()) {
      return res.status(403).json({ success: false, message: 'Access Denied. Cannot suspend listing of another community.' });
    }

    const updated = await Professional.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'Suspended' } },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Listing suspended successfully.', data: updated });
  } catch (error) {
    console.error('head suspendListing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 8. Restore listing scoped to Head's community
exports.restoreListing = async (req, res) => {
  try {
    const communityId = getCommunityId(req);
    if (!communityId) {
      return res.status(403).json({ success: false, message: 'Access Denied. No community assigned.' });
    }

    const listing = await Professional.findOne({ _id: req.params.id });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.communityId.toString() !== communityId.toString()) {
      return res.status(403).json({ success: false, message: 'Access Denied. Cannot restore listing of another community.' });
    }

    const updated = await Professional.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'Approved' } },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Listing restored successfully.', data: updated });
  } catch (error) {
    console.error('head restoreListing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 9. Categories CRUD for Head
const Category = require('../../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const list = await Category.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error('head getCategories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, icon, isActive } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category Name is required.' });
    }

    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const exists = await Category.findOne({ key });
    if (exists) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists.' });
    }

    const cat = new Category({
      name,
      key,
      icon: icon || 'Briefcase',
      isActive: isActive !== undefined ? isActive : true
    });

    await cat.save();
    res.status(201).json({ success: true, message: 'Category created successfully.', data: cat });
  } catch (error) {
    console.error('head createCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, icon, isActive } = req.body;
    const cat = await Category.findById(req.params.id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (name) {
      cat.name = name;
      cat.key = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
    }
    if (icon) cat.icon = icon;
    if (isActive !== undefined) cat.isActive = isActive;

    await cat.save();
    res.status(200).json({ success: true, message: 'Category updated successfully.', data: cat });
  } catch (error) {
    console.error('head updateCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    console.error('head deleteCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
