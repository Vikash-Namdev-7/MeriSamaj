const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// @desc    Create a new Sub-Leader (Vice President, Secretary, Treasurer, etc.)
// @route   POST /api/v1/head/leadership/sub-leaders
// @access  Private (Head/Admin)
exports.createSubLeader = async (req, res) => {
  try {
    const { name, email, phone, password, designation, department, termYears, socialLinks, headPermissions } = req.body;

    if (!name || !phone || !password || !designation) {
      return res.status(400).json({ status: 'error', message: 'Name, phone, password, and designation are required' });
    }

    // Check duplicate phone/email
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ status: 'error', message: 'Phone number already registered' });
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ status: 'error', message: 'Email address already registered' });
      }
    }

    // ── PERMISSION INHERITANCE SAFEGUARD ───────────────────────────────────────
    // Head can ONLY assign module permissions that Master Admin has granted to the Head!
    const headGrantedPermissions = req.user.headPermissions || {};
    const sanitizedPermissions = {};

    if (headPermissions && typeof headPermissions === 'object') {
      Object.keys(headPermissions).forEach(permKey => {
        if (headPermissions[permKey] === true) {
          // Admin has full access, otherwise verify Head possesses this permission
          if (req.user.role === 'admin' || headGrantedPermissions[permKey] === true) {
            sanitizedPermissions[permKey] = true;
          } else {
            console.warn(`[Permission Safeguard] Head '${req.user.name}' tried to assign ungranted permission '${permKey}' to Sub-Leader '${name}'. Stripped.`);
            sanitizedPermissions[permKey] = false;
          }
        } else {
          sanitizedPermissions[permKey] = false;
        }
      });
    }

    const subLeader = new User({
      name,
      email: email || undefined,
      phone,
      password,
      plainPassword: password,
      role: 'sub_head',
      parentHeadId: req.user._id,
      communityId: req.communityId || req.user.communityId,
      assignedCommunityIds: req.user.assignedCommunityIds || [req.communityId || req.user.communityId],
      city: req.user.city || 'Indore',
      state: req.user.state || 'Madhya Pradesh',
      designation: designation || 'Executive Member',
      department: department || 'General Governance',
      termYears: termYears || '2024-2027',
      joiningDate: new Date(),
      socialLinks: socialLinks || {},
      headPermissions: sanitizedPermissions,
      accountStatus: 'active'
    });

    await subLeader.save();

    res.status(201).json({
      status: 'success',
      message: 'Sub-leader created successfully',
      data: {
        id: subLeader._id,
        name: subLeader.name,
        email: subLeader.email,
        phone: subLeader.phone,
        designation: subLeader.designation,
        permissions: subLeader.headPermissions
      }
    });
  } catch (error) {
    console.error('createSubLeader error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to create sub-leader' });
  }
};

// @desc    Get all sub-leaders created by current Head
// @route   GET /api/v1/head/leadership/sub-leaders
// @access  Private (Head/Admin)
exports.getSubLeaders = async (req, res) => {
  try {
    const subLeaders = await User.find({ parentHeadId: req.user._id, role: 'sub_head' })
      .select('name email phone city state designation department avatar headPermissions accountStatus joiningDate createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      status: 'success',
      count: subLeaders.length,
      data: subLeaders
    });
  } catch (error) {
    console.error('getSubLeaders error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update Sub-Leader details and permissions
// @route   PUT /api/v1/head/leadership/sub-leaders/:id
// @access  Private (Head/Admin)
exports.updateSubLeader = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, designation, department, headPermissions, password } = req.body;

    const subLeader = await User.findOne({ _id: id, parentHeadId: req.user._id, role: 'sub_head' });
    if (!subLeader) {
      return res.status(404).json({ status: 'error', message: 'Sub-leader not found or unauthorized' });
    }

    if (name) subLeader.name = name;
    if (email) subLeader.email = email;
    if (phone) subLeader.phone = phone;
    if (designation) subLeader.designation = designation;
    if (department) subLeader.department = department;
    if (password) {
      subLeader.password = password;
      subLeader.plainPassword = password;
    }

    // Permission Inheritance Safeguard
    if (headPermissions && typeof headPermissions === 'object') {
      const headGrantedPermissions = req.user.headPermissions || {};
      const updatedPermissions = { ...subLeader.headPermissions };

      Object.keys(headPermissions).forEach(permKey => {
        if (headPermissions[permKey] === true) {
          if (req.user.role === 'admin' || headGrantedPermissions[permKey] === true) {
            updatedPermissions[permKey] = true;
          } else {
            updatedPermissions[permKey] = false;
          }
        } else {
          updatedPermissions[permKey] = false;
        }
      });
      subLeader.headPermissions = updatedPermissions;
    }

    await subLeader.save();

    res.status(200).json({
      status: 'success',
      message: 'Sub-leader updated successfully',
      data: subLeader
    });
  } catch (error) {
    console.error('updateSubLeader error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Enable/Disable Sub-Leader status
// @route   PATCH /api/v1/head/leadership/sub-leaders/:id/status
// @access  Private (Head/Admin)
exports.toggleSubLeaderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const subLeader = await User.findOne({ _id: id, parentHeadId: req.user._id, role: 'sub_head' });
    if (!subLeader) {
      return res.status(404).json({ status: 'error', message: 'Sub-leader not found or unauthorized' });
    }

    subLeader.accountStatus = subLeader.accountStatus === 'active' ? 'inactive' : 'active';
    await subLeader.save();

    res.status(200).json({
      status: 'success',
      message: `Sub-leader account status updated to ${subLeader.accountStatus}`,
      data: { id: subLeader._id, status: subLeader.accountStatus }
    });
  } catch (error) {
    console.error('toggleSubLeaderStatus error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Delete Sub-Leader
// @route   DELETE /api/v1/head/leadership/sub-leaders/:id
// @access  Private (Head/Admin)
exports.deleteSubLeader = async (req, res) => {
  try {
    const { id } = req.params;
    const subLeader = await User.findOneAndDelete({ _id: id, parentHeadId: req.user._id, role: 'sub_head' });
    if (!subLeader) {
      return res.status(404).json({ status: 'error', message: 'Sub-leader not found or unauthorized' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Sub-leader deleted successfully'
    });
  } catch (error) {
    console.error('deleteSubLeader error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
