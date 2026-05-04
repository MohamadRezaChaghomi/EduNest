// backend/src/controllers/authController.js

const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const LoginAttempt = require('../models/LoginAttempt');
const OTP = require('../models/OTP');
const { isUserBanned } = require('./adminController');
const sendEmail = require('../utils/email');
const sendSms = require('../utils/sms');
const { createLog } = require('../utils/logger');
const validateRegister = require('../validators/registerValidator');
const validateLogin = require('../validators/loginValidator');

// ---------- Helper: Set JWT cookies ----------
const setTokenCookies = (res, accessToken, refreshToken, rememberMe) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/auth/refresh',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
  });
};

const clearTokenCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
};

// ---------- Brute force protection ----------
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

const checkAndRecordFailedAttempt = async (identifier) => {
  let record = await LoginAttempt.findOne({ identifier });
  const now = new Date();

  if (record && record.lockedUntil && record.lockedUntil > now) {
    return { locked: true, remainingTime: record.lockedUntil - now };
  }

  if (!record) {
    record = await LoginAttempt.create({ identifier, attempts: 1 });
    return { locked: false, attempts: 1 };
  }

  if (record.lockedUntil && record.lockedUntil <= now) {
    record.attempts = 1;
    record.lockedUntil = null;
  } else {
    record.attempts += 1;
  }

  if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
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

// ---------- Register new user ----------
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate input
    const validationResult = validateRegister({ name, email, phone, password, role });
    if (validationResult !== true) {
      return res.status(400).json({ success: false, errors: validationResult });
    }

    // Check for existing user
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email or phone already exists.' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'user',
    });

    // Generate tokens
    const accessToken = user.getSignedJwtToken();
    const refreshTokenObj = await RefreshToken.createToken(user._id, false);
    setTokenCookies(res, accessToken, refreshTokenObj.token, false);

    // Log success
    await createLog({
      user: user._id,
      action: 'REGISTER',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Login user ----------
const login = async (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body;

    // Validate input
    const validationResult = validateLogin({ identifier, password });
    if (validationResult !== true) {
      return res.status(400).json({ success: false, errors: validationResult });
    }

    // Check brute force
    const lock = await checkAndRecordFailedAttempt(identifier);
    if (lock.locked) {
      const minutes = Math.ceil(lock.remainingTime / 60000);
      return res.status(423).json({
        success: false,
        message: `Too many failed attempts. Account locked for ${minutes} minutes.`,
      });
    }

    // Find user
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check ban status
    const banned = await isUserBanned(user._id);
    if (banned) {
      return res.status(403).json({ success: false, message: 'Account is banned.' });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Clear failed attempts
    await clearLoginAttempts(identifier);

    // Generate tokens
    const accessToken = user.getSignedJwtToken();
    const refreshTokenObj = await RefreshToken.createToken(user._id, rememberMe === true);
    setTokenCookies(res, accessToken, refreshTokenObj.token, rememberMe === true);

    // Log success
    await createLog({
      user: user._id,
      action: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Refresh access token ----------
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided.' });
    }

    const tokenDoc = await RefreshToken.findOne({ token: refreshToken, revoked: false });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    const user = await User.findById(tokenDoc.user);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const newAccessToken = user.getSignedJwtToken();
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    await createLog({
      user: user._id,
      action: 'REFRESH_TOKEN',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Access token refreshed.' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Logout (single device) ----------
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await RefreshToken.findOneAndDelete({ token: refreshToken });
    }
    clearTokenCookies(res);

    await createLog({
      user: req.user?._id,
      action: 'LOGOUT',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Logout from all devices ----------
const logoutAll = async (req, res) => {
  try {
    await RefreshToken.deleteMany({ user: req.user._id });
    clearTokenCookies(res);

    await createLog({
      user: req.user._id,
      action: 'LOGOUT_ALL',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Logged out from all devices.' });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Get current user profile ----------
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Update user profile ----------
const updateProfile = async (req, res) => {
  try {
    const { name, bio, profileImage, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (phone) user.phone = phone;

    await user.save();

    await createLog({
      user: user._id,
      action: 'UPDATE_PROFILE',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
    });

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
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Change password ----------
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    user.password = newPassword;
    await user.save();

    await createLog({
      user: user._id,
      action: 'CHANGE_PASSWORD',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// Alias for getMe
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Forgot password (send reset email) ----------
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please click: ${resetUrl} (valid for 10 minutes).`;

    await sendEmail({ email: user.email, subject: 'Password Reset', message });

    await createLog({
      user: user._id,
      action: 'FORGOT_PASSWORD_REQUEST',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Password reset email sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Reset password using token ----------
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await createLog({
      user: user._id,
      action: 'RESET_PASSWORD',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Request OTP for phone login ----------
const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    // Remove previous unverified OTPs
    await OTP.deleteMany({ phone, verified: false });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await OTP.create({ phone, code, expiresAt, attempts: 0, verified: false });
    await sendSms(phone, `Your EduNest verification code is: ${code}`);

    await createLog({
      action: 'REQUEST_OTP',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
      details: { phone },
    });

    res.json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Verify OTP and login/register ----------
const verifyOtp = async (req, res) => {
  try {
    const { phone, code, rememberMe } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: 'Phone and code are required.' });
    }

    const otpRecord = await OTP.findOne({ phone, code, verified: false });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code.' });
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      const tempEmail = `user_${phone}@temp.edunest.com`;
      user = await User.create({
        name: `User_${phone.slice(-4)}`,
        email: tempEmail,
        phone,
        password: crypto.randomBytes(20).toString('hex'),
        role: 'user',
      });
    }

    // Generate tokens
    const accessToken = user.getSignedJwtToken();
    const refreshTokenObj = await RefreshToken.createToken(user._id, rememberMe === true);
    setTokenCookies(res, accessToken, refreshTokenObj.token, rememberMe === true);

    await createLog({
      user: user._id,
      action: 'OTP_VERIFY_SUCCESS',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
      details: { phone, newUser: user.email.includes('temp') ? 'new' : 'existing' },
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  getMe,
  updateProfile,
  changePassword,
  getProfile,
  forgotPassword,
  resetPassword,
  requestOtp,
  verifyOtp,
};