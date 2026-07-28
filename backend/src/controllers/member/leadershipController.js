const Leadership = require('../../models/Leadership');
const User = require('../../models/User');
const mongoose = require('mongoose');
const { applyScopeFilter } = require('../../utils/queryScopeHelper');

// @desc    Get leadership directory for member's community (Dynamic Head + Sub-Leaders)
// @route   GET /api/v1/member/leadership
// @access  Private
exports.getCommunityLeadership = async (req, res) => {
  try {
    const { city, designation, search } = req.query;
    const rawCommunityId = req.communityId || req.user?.communityId;
    const targetCommunityId = (rawCommunityId && mongoose.Types.ObjectId.isValid(rawCommunityId))
      ? new mongoose.Types.ObjectId(rawCommunityId.toString())
      : (rawCommunityId ? rawCommunityId : new mongoose.Types.ObjectId('000000000000000000000000'));

    // 1. Fetch Main Community Head (Strictly scoped to targetCommunityId, NO global fallback)
    const headQuery = {
      role: 'head',
      accountStatus: 'active',
      $or: [
        { communityId: targetCommunityId },
        { assignedCommunityIds: targetCommunityId }
      ]
    };
    if (city && city !== 'all') {
      headQuery.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    const communityHeadUser = await User.findOne(headQuery)
      .select('name email phone city state designation bio avatar cover socialLinks termYears createdAt')
      .lean();

    const formattedHead = communityHeadUser ? {
      _id: communityHeadUser._id,
      name: communityHeadUser.name,
      initials: communityHeadUser.name ? communityHeadUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CH',
      designation: communityHeadUser.designation || 'Community Head',
      role: communityHeadUser.designation || 'President',
      city: communityHeadUser.city || 'Indore',
      state: communityHeadUser.state || 'Madhya Pradesh',
      phone: communityHeadUser.phone || '',
      email: communityHeadUser.email || '',
      bio: communityHeadUser.bio || 'Leading community governance and member welfare.',
      avatar: communityHeadUser.avatar || '',
      cover: communityHeadUser.cover || '',
      socialLinks: communityHeadUser.socialLinks || {},
      termYears: communityHeadUser.termYears || '2024-2027',
      isHead: true
    } : null;

    // 2. Fetch Sub-Leaders from User collection (unconditionally scoped via applyScopeFilter)
    const baseSubFilter = { role: 'sub_head', accountStatus: 'active' };
    if (designation && designation !== 'all') {
      baseSubFilter.designation = designation;
    }
    if (search && search.trim()) {
      const escapeRegex = (str) => (str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapeRegex(search.trim()), 'i');
      baseSubFilter.$or = [
        { name: searchRegex },
        { designation: searchRegex },
        { department: searchRegex }
      ];
    }
    const activeCity = (city && city !== 'all') ? city : null;
    const subLeadersQuery = applyScopeFilter(req, baseSubFilter, { overrideCity: activeCity });

    const subHeadUsers = await User.find(subLeadersQuery)
      .select('name email phone city state designation department bio avatar socialLinks termYears joiningDate')
      .sort({ createdAt: -1 })
      .lean();

    const formattedSubHeads = subHeadUsers.map(u => ({
      _id: u._id,
      name: u.name,
      initials: u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SL',
      designation: u.designation || 'Executive Member',
      role: u.designation || 'Executive Member',
      department: u.department || 'General Governance',
      city: u.city || 'Indore',
      state: u.state || 'Madhya Pradesh',
      phone: u.phone || '',
      email: u.email || '',
      bio: u.bio || '',
      avatar: u.avatar || '',
      socialLinks: u.socialLinks || {},
      termYears: u.termYears || '2024-2027',
      joiningDate: u.joiningDate,
      isHead: false
    }));

    // 3. Fetch entries from Leadership collection (unconditionally scoped via applyScopeFilter)
    const baseLegacyFilter = { isActive: true };
    if (designation && designation !== 'all') {
      baseLegacyFilter.role = designation;
    }
    const leadershipFilter = applyScopeFilter(req, baseLegacyFilter, { overrideCity: activeCity });

    const legacyLeaders = await Leadership.find(leadershipFilter).lean();
    const formattedLegacy = legacyLeaders.map(l => ({
      _id: l._id,
      name: l.name,
      initials: l.initials || (l.name ? l.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'LD'),
      designation: l.role || 'Committee Member',
      role: l.role || 'Committee Member',
      city: l.city || 'Indore',
      state: l.state || 'Madhya Pradesh',
      phone: l.phone || '',
      email: l.email || '',
      bio: l.bio || '',
      avatar: l.avatar || '',
      termYears: l.termYears || '2024-2027',
      isHead: false
    }));

    // Combine subordinate leaders (User sub_heads + Leadership docs) avoiding duplicates
    const allSubLeaders = [...formattedSubHeads];
    formattedLegacy.forEach(leg => {
      if (!allSubLeaders.some(s => s.name === leg.name)) {
        allSubLeaders.push(leg);
      }
    });

    // Extract unique designations for filtering
    const designationsSet = new Set(['Vice President', 'Secretary', 'Treasurer', 'Coordinator', 'Executive Member', 'Committee Member']);
    allSubLeaders.forEach(l => { if (l.designation) designationsSet.add(l.designation); });

    res.json({
      success: true,
      status: 'success',
      data: {
        communityHead: formattedHead,
        subLeaders: allSubLeaders,
        designations: Array.from(designationsSet)
      }
    });
  } catch (error) {
    console.error('getCommunityLeadership error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching leadership directory' });
  }
};
