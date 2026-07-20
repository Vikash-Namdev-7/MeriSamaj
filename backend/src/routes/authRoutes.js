const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAuth,
  updateProfile,
  sendOtp,
  verifyOtp,
  resetPassword,
  getPublicCommunities,
  getPublicCities
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/communities', getPublicCommunities);
router.get('/cities', getPublicCities);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/refresh', refreshAuth); // Public stateless refresh endpoint

// Profile update handles avatar upload via Cloudinary
router.put('/update-profile', protect, upload.single('avatarFile'), updateProfile);

module.exports = router;
