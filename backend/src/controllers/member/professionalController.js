const Professional = require('../../models/Professional');
const User = require('../../models/User');
const { notifyListingSubmitted, createNotification } = require('../../services/notificationService');
const { sendPushNotification } = require('../../services/pushNotificationService');
const { applyScopeFilter, inheritTenantPayload } = require('../../utils/queryScopeHelper');

const escapeRegex = (str) => (str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 1. Get all professionals with query filters (scoped to community)
exports.getProfessionals = async (req, res) => {
  try {
    const { search, category, city, page, limit } = req.query;

    const baseFilter = { status: 'Approved' };

    if (category && category !== 'All' && category !== 'All Categories' && category !== 'all') {
      baseFilter.categoryKey = category.toLowerCase().replace(/[^a-z0-9]+/g, '');
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      baseFilter.$or = [
        { companyName: searchRegex },
        { profession: searchRegex },
        { category: searchRegex },
        { city: searchRegex },
        { workAddress: searchRegex },
        { about: searchRegex }
      ];
    }

    const activeCity = (city && city !== 'All' && city !== 'All Cities') ? city : null;
    const filter = applyScopeFilter(req, baseFilter, { overrideCity: activeCity });

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = limit ? Math.max(1, Number(limit)) : 0;
    const skipNum = (pageNum - 1) * (limitNum || 100);

    let queryExec = Professional.find(filter)
      .populate('ownerId', 'name email phone avatar')
      .sort({ createdAt: -1 });

    if (limitNum > 0) {
      queryExec = queryExec.skip(skipNum).limit(limitNum);
    }

    const [listings, total] = await Promise.all([
      queryExec.lean(),
      Professional.countDocuments(filter)
    ]);

    const formatted = listings.map(p => ({
      id: p._id.toString(),
      title: p.companyName,
      category: p.category,
      categoryKey: p.categoryKey,
      profession: p.profession,
      city: p.city,
      rating: p.rating || 5.0,
      initials: p.initials || (p.companyName ? p.companyName.substring(0, 2).toUpperCase() : 'BU'),
      phone: p.phone || (p.ownerId ? p.ownerId.phone : ''),
      verified: p.status === 'Approved',
      description: p.about,
      experience: p.yearsOfExperience,
      address: p.workAddress,
      businessTiming: p.businessTiming || '09:00 AM - 08:00 PM',
      logo: p.media ? (p.media.find(m => m.type === 'image')?.url || null) : null,
      media: (p.media || []).map(m => ({ type: m.type, url: m.url })),
      ownerId: p.ownerId ? (p.ownerId._id ? p.ownerId._id.toString() : p.ownerId.toString()) : null
    }));

    res.status(200).json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum || total,
        pages: limitNum > 0 ? Math.ceil(total / limitNum) : 1
      }
    });
  } catch (error) {
    console.error('getProfessionals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 2. Get Single Professional Detail
exports.getProfessionalById = async (req, res) => {
  try {
    const query = applyScopeFilter(req, { _id: req.params.id });
    const p = await Professional.findOne(query)
      .populate('ownerId', 'name email phone avatar')
      .lean();

    if (!p) {
      return res.status(404).json({ success: false, message: 'Business listing not found.' });
    }

    const data = {
      id: p._id.toString(),
      title: p.companyName,
      category: p.category,
      categoryKey: p.categoryKey,
      city: p.city,
      rating: p.rating || 5.0,
      initials: p.initials || (p.companyName ? p.companyName.substring(0, 2).toUpperCase() : 'BU'),
      phone: p.phone || (p.ownerId ? p.ownerId.phone : ''),
      verified: p.status === 'Approved',
      description: p.about,
      experience: p.yearsOfExperience,
      address: p.workAddress,
      businessTiming: p.businessTiming || '09:00 AM - 08:00 PM',
      logo: p.media ? (p.media.find(m => m.type === 'image')?.url || null) : null,
      media: (p.media || []).map(m => ({ type: m.type, url: m.url })),
      ownerId: p.ownerId ? (p.ownerId._id ? p.ownerId._id.toString() : p.ownerId.toString()) : null
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('getProfessionalById error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 3. Create Professional Listing
exports.createProfessional = async (req, res) => {
  try {
    const payload = inheritTenantPayload(req, req.body);
    if (!payload.communityId) {
      return res.status(400).json({ success: false, message: 'No community context found.' });
    }

    const { category, profession, companyName, yearsOfExperience, workAddress, city, about, media, businessTiming } = payload;

    if (!category || !profession || !companyName || !yearsOfExperience || !workAddress || !about) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    const categoryKey = category.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const initials = companyName.substring(0, 2).toUpperCase();

    // Derive city from explicit input, user profile, or workAddress fallback
    const resolvedCity = city || (req.user?.city ? req.user.city : (workAddress ? workAddress.split(',').pop().trim() : ''));
    if (!resolvedCity) {
      return res.status(400).json({ success: false, message: 'City is required for business listing.' });
    }

    const p = new Professional({
      ...payload,
      ownerId: req.user._id,
      category,
      categoryKey,
      profession,
      companyName,
      yearsOfExperience: Number(yearsOfExperience),
      workAddress,
      city: resolvedCity,
      about,
      media: media || [],
      initials,
      status: 'Pending',
      businessTiming: businessTiming || '09:00 AM - 08:00 PM',
      approval: {
        approvedBy: null,
        approvedAt: null,
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null
      },
      credentialVerificationStatus: 'PENDING'
    });

    await p.save();

    // ── Notification: alert community head about new pending listing ──────────
    try {
      const Community = require('../../models/Community');
      const comm = await Community.findById(p.communityId).select('headId').lean();
      if (comm?.headId) {
        notifyListingSubmitted(comm.headId, req.user.name || 'A member', p.companyName, p._id);
      }
    } catch (notifErr) {
      console.warn('[Notify] createProfessional listing_submitted failed:', notifErr.message);
    }

    res.status(201).json({ success: true, data: p });
  } catch (error) {
    console.error('createProfessional error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 4. Update Professional Listing
exports.updateProfessional = async (req, res) => {
  try {
    const userRole = (req.user?.role || '').toLowerCase();
    const isPrivilegedAdmin = ['admin', 'super_admin', 'master_admin', 'master'].includes(userRole);
    const query = isPrivilegedAdmin ? { _id: req.params.id } : applyScopeFilter(req, { _id: req.params.id });
    const p = await Professional.findOne(query);
    if (!p) {
      return res.status(404).json({ success: false, message: 'Business listing not found.' });
    }

    // Verify ownership
    if (!isPrivilegedAdmin && p.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this listing.' });
    }

    const { category, profession, companyName, yearsOfExperience, workAddress, city, about, media, status, businessTiming } = req.body;

    if (category) {
      p.category = category;
      p.categoryKey = category.toLowerCase().replace(/[^a-z0-9]+/g, '');
    }
    if (profession) p.profession = profession;
    if (companyName) {
      p.companyName = companyName;
      p.initials = companyName.substring(0, 2).toUpperCase();
    }
    if (yearsOfExperience) p.yearsOfExperience = Number(yearsOfExperience);
    if (workAddress) {
      p.workAddress = workAddress;
      p.city = city || workAddress.split(',').pop().trim() || p.city;
    }
    if (about) p.about = about;
    if (media) p.media = media;
    if (businessTiming) p.businessTiming = businessTiming;
    if (status && req.user.role === 'admin') p.status = status;

    await p.save();
    res.status(200).json({ success: true, data: p });
  } catch (error) {
    console.error('updateProfessional error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 5. Delete Professional Listing
exports.deleteProfessional = async (req, res) => {
  try {
    const userRole = (req.user?.role || '').toLowerCase();
    const isPrivilegedAdmin = ['admin', 'super_admin', 'master_admin', 'master'].includes(userRole);
    const query = isPrivilegedAdmin ? { _id: req.params.id } : applyScopeFilter(req, { _id: req.params.id });
    const p = await Professional.findOne(query);
    if (!p) {
      return res.status(404).json({ success: false, message: 'Business listing not found.' });
    }

    // Verify ownership
    if (!isPrivilegedAdmin && p.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing.' });
    }

    await Professional.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Business listing deleted.' });
  } catch (error) {
    console.error('deleteProfessional error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 6. Get Active Categories
const Category = require('../../models/Category');
exports.getActiveCategories = async (req, res) => {
  try {
    const list = await Category.find({ isActive: true }).select('name key icon').lean();
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error('getActiveCategories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 7. Submit Business Lead / Enquiry
exports.submitBusinessEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, senderPhone } = req.body;

    const professional = await Professional.findById(id);
    if (!professional) {
      return res.status(404).json({ success: false, message: 'Business listing not found.' });
    }

    // Trigger In-App + FCM Push Lead Notification to Business Owner
    if (professional.ownerId) {
      const notification = await createNotification({
        userId: professional.ownerId,
        communityId: professional.communityId,
        module: 'professional',
        type: 'business_enquiry',
        title: 'New Business Lead 💼',
        message: `${req.user?.name || 'A customer'} sent an enquiry for "${professional.companyName}": "${message || 'Interested in your services'}"`,
        icon: '💼',
        priority: 'high',
        actionUrl: `/member/professional/${professional._id}`,
        referenceId: professional._id,
        referenceType: 'Professional'
      });

      if (notification) {
        sendPushNotification({
          userId: professional.ownerId,
          notificationId: notification._id,
          type: 'business_enquiry',
          title: 'New Business Lead 💼',
          message: `${req.user?.name || 'A customer'} sent an enquiry for "${professional.companyName}". Phone: ${senderPhone || req.user?.phone || 'N/A'}`,
          icon: '💼',
          actionUrl: `/member/professional/${professional._id}`
        }).catch(err => console.error('[EnquiryPushError]', err.message));
      }
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry sent successfully to business owner.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
