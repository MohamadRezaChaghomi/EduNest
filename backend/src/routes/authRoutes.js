const express = require('express');
const { register, login, logout, getMe, updateProfile, changePassword, getProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);          // <-- new
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/profile', protect, getProfile);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);

module.exports = router;