const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate stateless access and refresh tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '30m' } // Access Token expires in 30 minutes
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    { expiresIn: '7d' } // Refresh Token expires in 7 days
  );

  return { accessToken, refreshToken };
};

const getUserResponsePayload = (user) => {
  return {
    id: user._id,
    name: user.name || 'Member',
    phone: user.phone,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    gender: user.gender,
    dob: user.dob,
    bloodGroup: user.bloodGroup,
    maritalStatus: user.maritalStatus,
    gotra: user.gotra,
    community: user.community || 'Agrawal Samaj',
    subCommunity: user.subCommunity,
    city: user.city,
    district: user.district,
    state: user.state,
    pincode: user.pincode,
    country: user.country || 'India',
    qualification: user.qualification,
    school: user.school,
    passingYear: user.passingYear,
    profession: user.profession,
    company: user.company,
    annualIncome: user.annualIncome,
    workCity: user.workCity,
    detailedAddress: user.detailedAddress,
    familyMembers: user.familyMembers || [],
    accountStatus: user.accountStatus,
    verificationStatus: user.verificationStatus,
    isVerified: user.isVerified || (user.verificationStatus === 'verified')
  };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { phone, email, password, referralCode } = req.body;

  try {
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const userData = {
      phone,
      password,
      referralCode,
      accountStatus: 'active',
      verificationStatus: 'verified', // Verified by default in dev environment
      isPhoneVerified: true,
      isEmailVerified: true
    };

    if (email && email.trim() !== '') {
      userData.email = email.trim().toLowerCase();
    }

    const user = await User.create(userData);

    if (user) {
      const { accessToken, refreshToken } = generateTokens(user);
      
      // Store Refresh Token in HttpOnly cookie
      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        user: getUserResponsePayload(user),
        accessToken
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get tokens
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Phone/Email and password are required' });
    }

    // Check for user email or phone
    const user = await User.findOne({
      $or: [{ email: identifier.trim().toLowerCase() }, { phone: identifier.trim() }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check account status
    if (user.accountStatus === 'blocked') {
      return res.status(403).json({ message: 'Your account is blocked. Contact Samaj Admin.' });
    }
    if (user.accountStatus === 'deleted') {
      return res.status(403).json({ message: 'Your account has been deleted.' });
    }

    const isMatch = await user.matchPassword(password);
    if (isMatch) {
      const { accessToken, refreshToken } = generateTokens(user);
      
      // Store Refresh Token in HttpOnly cookie
      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        user: getUserResponsePayload(user),
        accessToken
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: true,
    sameSite: 'none'
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Refresh access token (Stateless)
// @route   POST /api/auth/refresh
// @access  Public
const refreshAuth = async (req, res) => {
  const refreshToken = req.cookies.jwt;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Verify account status
    if (user.accountStatus === 'blocked' || user.accountStatus === 'deleted' || user.accountStatus === 'inactive') {
      return res.status(403).json({ message: 'Account status is not active' });
    }

    const tokens = generateTokens(user);

    // Rotate refresh token cookie
    res.cookie('jwt', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: getUserResponsePayload(user),
      accessToken: tokens.accessToken
    });
  } catch (error) {
    console.error('Refresh Token Verification Failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// @desc    Update user profile (Onboarding details)
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Basic Fields
      user.name = req.body.name || user.name;
      user.gender = req.body.gender || user.gender;
      user.dob = req.body.dob || user.dob;
      user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
      user.maritalStatus = req.body.maritalStatus || user.maritalStatus;
      user.gotra = req.body.gotra || user.gotra;
      
      // Avatar upload handling
      if (req.file) {
        user.avatar = req.file.path;
      } else if (req.body.avatar) {
        user.avatar = req.body.avatar;
      }
      
      // Community
      user.community = req.body.community || user.community;
      user.subCommunity = req.body.subCommunity || user.subCommunity;
      
      // Location
      user.city = req.body.city || user.city;
      user.district = req.body.district || user.district;
      user.state = req.body.state || user.state;
      user.pincode = req.body.pincode || user.pincode;
      user.country = req.body.country || user.country;

      // Education & Profession
      user.qualification = req.body.qualification || user.qualification;
      user.school = req.body.school || user.school;
      user.passingYear = req.body.passingYear || user.passingYear;
      user.profession = req.body.profession || user.profession;
      user.company = req.body.company || user.company;
      user.annualIncome = req.body.annualIncome || user.annualIncome;
      user.workCity = req.body.workCity || user.workCity;
      
      // Address
      user.houseNumber = req.body.houseNumber || user.houseNumber;
      user.streetAddress = req.body.streetAddress || user.streetAddress;
      user.landmark = req.body.landmark || user.landmark;
      user.areaAddress = req.body.areaAddress || user.areaAddress;
      user.pincodeAddress = req.body.pincodeAddress || user.pincodeAddress;
      user.detailedAddress = req.body.detailedAddress || user.detailedAddress;
      user.alternatePhone = req.body.alternatePhone || user.alternatePhone;
      user.alternateEmail = req.body.alternateEmail || user.alternateEmail;
      
      // Family Members
      if (req.body.familyMembers) {
        try {
          user.familyMembers = typeof req.body.familyMembers === 'string' 
            ? JSON.parse(req.body.familyMembers) 
            : req.body.familyMembers;
        } catch (e) {
          user.familyMembers = req.body.familyMembers;
        }
      }
      
      // Preferences
      user.prefEducation = req.body.prefEducation || user.prefEducation;
      user.prefAge = req.body.prefAge || user.prefAge;
      user.prefHeight = req.body.prefHeight || user.prefHeight;
      user.prefOccupation = req.body.prefOccupation || user.prefOccupation;
      user.prefCity = req.body.prefCity || user.prefCity;
      
      // Device tokens / FCM
      if (req.body.deviceToken) {
        if (!user.deviceTokens.includes(req.body.deviceToken)) {
          user.deviceTokens.push(req.body.deviceToken);
        }
      }

      // Verification Flags
      user.isAadharVerified = req.body.isAadharVerified !== undefined ? req.body.isAadharVerified : user.isAadharVerified;
      user.isFaceVerified = req.body.isFaceVerified !== undefined ? req.body.isFaceVerified : user.isFaceVerified;

      const updatedUser = await user.save();

      res.json({
        ...getUserResponsePayload(updatedUser),
        message: 'Profile updated successfully'
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Simulated OTP sending (returns default OTP '1234' for development)
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }
  res.json({ message: 'OTP sent successfully (simulated)', otp: '1234' });
};

// @desc    Simulated OTP verification (accepts '1234')
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required' });
  }

  if (otp === '1234') {
    res.json({ message: 'OTP verified successfully (simulated)' });
  } else {
    res.status(400).json({ message: 'Invalid OTP code' });
  }
};

// @desc    Reset password (accepts default OTP '1234')
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { phone, otp, newPassword } = req.body;

  try {
    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ message: 'Phone, OTP and new password are required' });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this mobile number' });
    }

    if (otp !== '1234') {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAuth,
  updateProfile,
  sendOtp,
  verifyOtp,
  resetPassword
};
