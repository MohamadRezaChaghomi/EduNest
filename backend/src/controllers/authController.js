const User = require('../models/User');
const { isUserBanned } = require('./adminController');
const validateRegister = require('../validators/registerValidator');
const validateLogin = require('../validators/loginValidator');
const crypto = require('crypto');
const sendEmail = require('../utils/email');


// Helper: set JWT cookie
const setTokenCookie = (res, token, rememberMe) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days or 1 day
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: 'strict',
    maxAge: maxAge,
  });
};

// Register
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const validationResult = validateRegister({ name, email, phone, password, role });
    if (validationResult !== true) return res.status(400).json({ errors: validationResult });

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) return res.status(400).json({ message: 'Email or phone already exists' });

    const user = await User.create({ name, email, phone, password, role: role || 'user' });
    const token = user.getSignedJwtToken();
    // Set cookie with default (no rememberMe)
    setTokenCookie(res, token, false);
    res.status(201).json({
      success: true,
      token, // optional, for clients that still need it
      user: { id: user._id, name, email, phone, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login with rememberMe
const login = async (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body;
    const validationResult = validateLogin({ identifier, password });
    if (validationResult !== true) return res.status(400).json({ errors: validationResult });

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const banned = await isUserBanned(user._id);
    if (banned) return res.status(403).json({ message: 'Your account has been banned.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = user.getSignedJwtToken();
    // Set cookie with rememberMe option
    setTokenCookie(res, token, rememberMe === true);
    res.json({
      success: true,
      token, // optional
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout: clear cookie
const logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
  res.json({ success: true, message: 'Logged out successfully' });
};

// Get current user (from cookie or token header)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, bio, profileImage, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (phone) user.phone = phone;
    await user.save();
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, bio: user.bio, profileImage: user.profileImage } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword))) return res.status(401).json({ message: 'Current password is incorrect' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpire');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot password - send reset token to email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide an email' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    // Generate reset token (plain text)
    const resetToken = crypto.randomBytes(20).toString('hex');
    // Hash token and save to DB
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset URL (frontend URL)
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you requested a password reset. Please click the following link to reset your password (valid for 10 minutes):\n\n${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message,
      });
      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token from URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Optionally, generate new JWT and send in response
    const token = user.getSignedJwtToken();
    res.json({
      success: true,
      token,
      message: 'Password reset successful',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, logout, getMe, updateProfile, changePassword, getProfile };