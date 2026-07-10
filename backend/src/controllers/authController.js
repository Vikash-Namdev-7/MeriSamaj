const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

const getUserResponsePayload = (user) => {
  return {
    id: user._id,
    name: user.name || 'Member',
    phone: user.phone,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    community: user.community || 'Agrawal Samaj',
    subCommunity: user.subCommunity,
    city: user.city,
    isVerified: user.isVerified
  };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { phone, email, password, referralCode } = req.body;

  try {
    const userExists = await User.findOne({ phone });

    if (userExists) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const userData = {
      phone,
      password,
      referralCode
    };

    if (email && email.trim() !== '') {
      userData.email = email.trim().toLowerCase();
    }

    const user = await User.create(userData);

    if (user) {
      const token = generateToken(user._id);
      
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        user: getUserResponsePayload(user),
        accessToken: token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    // Check for user email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        user: getUserResponsePayload(user),
        accessToken: token
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
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile (refresh token logic placeholder)
// @route   POST /api/auth/refresh
// @access  Private
const refreshAuth = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const token = generateToken(user._id);
    res.json({
      user: getUserResponsePayload(user),
      accessToken: token
    });
  } else {
    res.status(404).json({ message: 'User not found' });
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
      
      // Avatar upload handling (Cloudinary sets req.file)
      if (req.file) {
        user.avatar = req.file.path;
      } else if (req.body.avatar) {
        // Fallback for base64 strings if sent directly instead of file
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
          user.familyMembers = JSON.parse(req.body.familyMembers);
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

// Mock OTP Methods for UI flow
const sendOtp = async (req, res) => {
  res.json({ message: 'OTP sent successfully (mocked)' });
};

const verifyOtp = async (req, res) => {
  res.json({ message: 'OTP verified successfully (mocked)' });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAuth,
  updateProfile,
  sendOtp,
  verifyOtp
};
