const Professional = require('../../models/Professional');
const User = require('../../models/User');
const { notifyListingApproved, notifyListingRejected } = require('../../services/notificationService');

// 1. Get all listings with filters, pagination, and dynamic statistics
exports.getListings = async (req, res) => {
  try {
    const { search, status, category, city, community, credentialVerificationStatus, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.categoryKey = category.toLowerCase().replace(/[^a-z0-9]+/g, '');
    if (city) filter.city = { $regex: new RegExp(`^${city}$`, 'i') };
    if (community) filter.communityId = community;
    if (credentialVerificationStatus) filter.credentialVerificationStatus = credentialVerificationStatus;

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

    const listings = await Professional.find(filter)
      .populate('ownerId', 'name email phone avatar')
      .populate('communityId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skipIndex);

    const totalDocs = await Professional.countDocuments(filter);

    // Dynamic Statistics calculation
    const total = await Professional.countDocuments({});
    const pending = await Professional.countDocuments({ status: 'Pending' });
    const approved = await Professional.countDocuments({ status: 'Approved' });
    const rejected = await Professional.countDocuments({ status: 'Rejected' });
    const suspended = await Professional.countDocuments({ status: 'Suspended' });
    const verified = await Professional.countDocuments({ credentialVerificationStatus: 'VERIFIED' });

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
      community: p.communityId ? p.communityId.name : 'Unknown Community',
      communityId: p.communityId ? p.communityId._id : null,
      status: p.status,
      credentialVerificationStatus: p.credentialVerificationStatus,
      approval: p.approval || {},
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
          verified
        }
      }
    });
  } catch (error) {
    console.error('admin getListings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 2. Get single listing detail
exports.getListingById = async (req, res) => {
  try {
    const p = await Professional.findById(req.params.id)
      .populate('ownerId', 'name email phone avatar')
      .populate('communityId', 'name')
      .populate('approval.approvedBy.userId', 'name')
      .populate('approval.rejectedBy.userId', 'name')
      .populate('verifiedBy', 'name');

    if (!p) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
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
    console.error('admin getListingById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 3. Approve listing (atomic update)
exports.approveListing = async (req, res) => {
  try {
    const listing = await Professional.findOne({ _id: req.params.id });
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.status === 'Suspended') {
      return res.status(400).json({ success: false, message: 'Listing is suspended. Re-activate or verify it instead.' });
    }

    // Atomic update to prevent race conditions
    const updated = await Professional.findOneAndUpdate(
      { _id: req.params.id, status: 'Pending' },
      {
        $set: {
          status: 'Approved',
          approval: {
            approvedBy: { userId: req.user._id, role: 'ADMIN' },
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
      // Re-fetch to return currently approved or modified state
      const current = await Professional.findById(req.params.id);
      return res.status(200).json({ 
        success: true, 
        message: `Listing is already actioned. Current status: ${current.status}`, 
        data: current 
      });
    }

    // ── Notification: notify listing owner ─────────────────────────────────────
    try {
      if (updated.ownerId) {
        notifyListingApproved(updated.ownerId, updated.companyName, updated._id);
      }
    } catch (notifErr) {
      console.warn('[Notify] admin approveListing listing_approved failed:', notifErr.message);
    }

    res.status(200).json({ success: true, message: 'Listing approved successfully.', data: updated });
  } catch (error) {
    console.error('admin approveListing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 4. Reject listing
exports.rejectListing = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    const updated = await Professional.findOneAndUpdate(
      { _id: req.params.id, status: 'Pending' },
      {
        $set: {
          status: 'Rejected',
          approval: {
            rejectedBy: { userId: req.user._id, role: 'ADMIN' },
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

    // ── Notification: notify listing owner ─────────────────────────────────────
    try {
      if (updated.ownerId) {
        notifyListingRejected(updated.ownerId, updated.companyName, reason, updated._id);
      }
    } catch (notifErr) {
      console.warn('[Notify] admin rejectListing listing_rejected failed:', notifErr.message);
    }

    res.status(200).json({ success: true, message: 'Listing rejected successfully.', data: updated });
  } catch (error) {
    console.error('admin rejectListing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 5. Verify credentials
exports.verifyCredentials = async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status || !['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid verification status is required.' });
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

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    res.status(200).json({ success: true, message: 'Credentials updated successfully.', data: updated });
  } catch (error) {
    console.error('admin verifyCredentials error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 6. Suspend listing
exports.suspendListing = async (req, res) => {
  try {
    const updated = await Professional.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'Suspended' } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    res.status(200).json({ success: true, message: 'Listing suspended successfully.', data: updated });
  } catch (error) {
    console.error('admin suspendListing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 6.b Reactivate listing
exports.reactivateListing = async (req, res) => {
  try {
    const updated = await Professional.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'Approved' } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    res.status(200).json({ success: true, message: 'Listing reactivated successfully.', data: updated });
  } catch (error) {
    console.error('admin reactivateListing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 7. Get filter options dynamically
exports.getFilterOptions = async (req, res) => {
  try {
    const categories = await Professional.distinct('category');
    const cities = await Professional.distinct('city');
    
    const Community = require('../../models/Community');
    const communities = await Community.find({}).select('name');

    res.status(200).json({
      success: true,
      data: {
        categories: categories.filter(Boolean),
        cities: cities.filter(Boolean),
        communities: communities.map(c => ({ id: c._id.toString(), name: c.name }))
      }
    });
  } catch (error) {
    console.error('getFilterOptions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 8. Categories CRUD for Admin
const Category = require('../../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const list = await Category.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error('getCategories error:', error);
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
    console.error('createCategory error:', error);
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
    console.error('updateCategory error:', error);
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
    console.error('deleteCategory error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 9. Delete listing (Admin has no community scoping boundaries)
exports.deleteListing = async (req, res) => {
  try {
    const deleted = await Professional.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }
    res.status(200).json({ success: true, message: 'Listing deleted successfully.' });
  } catch (error) {
    console.error('admin deleteListing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
