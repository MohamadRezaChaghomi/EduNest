const User = require('../models/User');
const { isUserBanned } = require('./adminController');
const validateRegister = require('../validators/registerValidator');
const validateLogin = require('../validators/loginValidator');

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

module.exports = { register, login, logout, getMe, updateProfile, changePassword, getProfile };