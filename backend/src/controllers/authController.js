const crypto = require('crypto');
const User = require('../models/User');
const LoginAttempt = require('../models/LoginAttempt');
const { isUserBanned } = require('./adminController');
const sendEmail = require('../utils/email');
const validateRegister = require('../validators/registerValidator');
const validateLogin = require('../validators/loginValidator');

// ---------- Helper: Set JWT cookie ----------
const setTokenCookie = (res, token, rememberMe) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days or 1 day
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: maxAge,
  });
};

// ---------- Brute Force Helpers ----------
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15; // 15 minutes

const checkAndRecordFailedAttempt = async (identifier) => {
  let record = await LoginAttempt.findOne({ identifier });
  const now = new Date();

  if (record && record.lockedUntil && record.lockedUntil > now) {
    // Still locked
    return { locked: true, remainingTime: record.lockedUntil - now };
  }

  if (!record) {
    // First failed attempt
    record = await LoginAttempt.create({ identifier, attempts: 1, lockedUntil: null });
    return { locked: false, attempts: record.attempts };
  }

  // Existing record but not locked (or lock expired)
  if (record.lockedUntil && record.lockedUntil <= now) {
    // Lock expired, reset attempts
    record.attempts = 1;
    record.lockedUntil = null;
  } else {
    record.attempts += 1;
  }

  if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
    // Lock account
    record.lockedUntil = new Date(now.getTime() + LOCK_TIME_MINUTES * 60 * 1000);
    await record.save();
    return { locked: true, remainingTime: record.lockedUntil - now };
  }

  await record.save();
  return { locked: false, attempts: record.attempts };
};

const clearLoginAttempts = async (identifier) => {
  await LoginAttempt.findOneAndDelete({ identifier });
};

// ---------- Register ----------
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const validationResult = validateRegister({ name, email, phone, password, role });
    if (validationResult !== true) return res.status(400).json({ errors: validationResult });

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) return res.status(400).json({ message: 'Email or phone already exists' });

    const user = await User.create({ name, email, phone, password, role: role || 'user' });
    const token = user.getSignedJwtToken();
    setTokenCookie(res, token, false);
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name, email, phone, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Login (with brute force protection & remember me) ----------
const login = async (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body;
    const validationResult = validateLogin({ identifier, password });
    if (validationResult !== true) return res.status(400).json({ errors: validationResult });

    // Check brute force lock
    const lockStatus = await checkAndRecordFailedAttempt(identifier);
    if (lockStatus.locked) {
      const remainingMinutes = Math.ceil(lockStatus.remainingTime / 60000);
      return res.status(423).json({
        message: `Too many failed attempts. Account locked for ${remainingMinutes} minutes.`
      });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    }).select('+password');
    if (!user) {
      // failed attempt already counted in checkAndRecordFailedAttempt
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const banned = await isUserBanned(user._id);
    if (banned) return res.status(403).json({ message: 'Your account has been banned.' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Successful login - clear attempts
    await clearLoginAttempts(identifier);

    const token = user.getSignedJwtToken();
    setTokenCookie(res, token, rememberMe === true);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Logout ----------
const logout = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
  res.json({ success: true, message: 'Logged out successfully' });
};

// ---------- Get current user (from cookie or header) ----------
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Update profile (name, bio, profileImage, phone) ----------
const updateProfile = async (req, res) => {
  try {
    const { name, bio, profileImage, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (phone) user.phone = phone;
    await user.save();
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        bio: user.bio,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Change password ----------
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Get full profile (detailed) ----------
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpire');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Forgot Password ----------
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
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click the link below (valid for 10 minutes):\n\n${resetUrl}`;

    try {
      await sendEmail({ email: user.email, subject: 'Password Reset', message });
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

// ---------- Reset Password ----------
const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

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

    const token = user.getSignedJwtToken();
    setTokenCookie(res, token, false); // optional, keep logged in after reset
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

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getProfile,
  forgotPassword,
  resetPassword,
};