const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const LoginAttempt = require('../models/LoginAttempt');
const OTP = require('../models/OTP');
const { isUserBanned } = require('./adminController');
const sendEmail = require('../utils/email');
const sendSms = require('../utils/sms'); // placeholder
const { createLog } = require('../utils/logger');
const validateRegister = require('../validators/registerValidator');
const validateLogin = require('../validators/loginValidator');

// ---------- Helper: Set JWT cookies ----------
const setTokenCookies = (res, accessToken, refreshToken, rememberMe) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/api/auth/refresh',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
  });
};

const clearTokenCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
};

// ---------- Brute Force Helpers ----------
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

// ---------- Register ----------
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const validationResult = validateRegister({ name, email, phone, password, role });
    if (validationResult !== true) return res.status(400).json({ errors: validationResult });

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(400).json({ message: 'Email or phone already exists' });

    const user = await User.create({ name, email, phone, password, role: role || 'user' });
    const accessToken = user.getSignedJwtToken();
    const refreshTokenObj = await RefreshToken.createToken(user._id, false);
    setTokenCookies(res, accessToken, refreshTokenObj.token, false);

    await createLog({ user: user._id, action: 'REGISTER', status: 'SUCCESS', ip: req.clientIp, userAgent: req.userAgent });
    res.status(201).json({ success: true, user: { id: user._id, name, email, phone, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Login ----------
const login = async (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body;
    const validationResult = validateLogin({ identifier, password });
    if (validationResult !== true) return res.status(400).json({ errors: validationResult });

    const lock = await checkAndRecordFailedAttempt(identifier);
    if (lock.locked) {
      const minutes = Math.ceil(lock.remainingTime / 60000);
      return res.status(423).json({ message: `Too many failed attempts. Locked for ${minutes} minutes.` });
    }

    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const banned = await isUserBanned(user._id);
    if (banned) return res.status(403).json({ message: 'Account banned' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    await clearLoginAttempts(identifier);
    const accessToken = user.getSignedJwtToken();
    const refreshTokenObj = await RefreshToken.createToken(user._id, rememberMe === true);
    setTokenCookies(res, accessToken, refreshTokenObj.token, rememberMe === true);

    await createLog({ user: user._id, action: 'LOGIN_SUCCESS', status: 'SUCCESS', ip: req.clientIp, userAgent: req.userAgent });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Refresh ----------
const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken, revoked: false });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) return res.status(401).json({ message: 'Invalid or expired refresh token' });
    const user = await User.findById(tokenDoc.user);
    if (!user) return res.status(401).json({ message: 'User not found' });
    const newAccessToken = user.getSignedJwtToken();
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: isProduction, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    await createLog({ user: user._id, action: 'REFRESH_TOKEN', status: 'SUCCESS', ip: req.clientIp, userAgent: req.userAgent });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Logout ----------
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) await RefreshToken.findOneAndDelete({ token: refreshToken });
    clearTokenCookies(res);
    await createLog({ user: req.user?._id, action: 'LOGOUT', status: 'SUCCESS', ip: req.clientIp, userAgent: req.userAgent });
    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const logoutAll = async (req, res) => {
  try {
    await RefreshToken.deleteMany({ user: req.user._id });
    clearTokenCookies(res);
    await createLog({ user: req.user._id, action: 'LOGOUT_ALL', status: 'SUCCESS', ip: req.clientIp, userAgent: req.userAgent });
    res.json({ success: true, message: 'Logged out from all devices' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Profile ----------
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, profileImage, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (phone) user.phone = phone;
    await user.save();
    await createLog({ user: user._id, action: 'UPDATE_PROFILE', status: 'SUCCESS', ip: req.clientIp, userAgent: req.userAgent });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, bio: user.bio, profileImage: user.profileImage } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword))) return res.status(401).json({ message: 'Current password is incorrect' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
    user.password = newPassword;
    await user.save();
    await createLog({ user: user._id, action: 'CHANGE_PASSWORD', status: 'SUCCESS', ip: req.clientIp, userAgent: req.userAgent });
    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpire');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Forgot / Reset Password ----------
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user with that email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click: ${resetUrl} (valid 10 min)`;
    await sendEmail({ email: user.email, subject: 'Password Reset', message });

    await createLog({ user: user._id, action: 'FORGOT_PASSWORD_REQUEST', status: 'SUCCESS', ip: req.clientIp, userAgent: req.userAgent });
    res.json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password too short' });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await createLog({ user: user._id, action: 'RESET_PASSWORD', status: 'SUCCESS', ip: req.clientIp, userAgent: req.userAgent });
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- OTP ----------
const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone required' });
    await OTP.deleteMany({ phone, verified: false });
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await OTP.create({ phone, code, expiresAt });
    await sendSms(phone, `Your EduNest code: ${code}`);
    await createLog({ action: 'REQUEST_OTP', status: 'SUCCESS', ip: req.clientIp, userAgent: req.userAgent, details: { phone } });
    res.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phone, code, rememberMe } = req.body;
    if (!phone || !code) return res.status(400).json({ message: 'Phone and code required' });
    const otpRecord = await OTP.findOne({ phone, code, verified: false });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }
    await OTP.deleteOne({ _id: otpRecord._id });
    let user = await User.findOne({ phone });
    if (!user) {
      const tempEmail = `user_${phone}@temp.edunest.com`;
      user = await User.create({ name: `User_${phone.slice(-4)}`, email: tempEmail, phone, password: crypto.randomBytes(20).toString('hex'), role: 'user' });
    }
    const accessToken = user.getSignedJwtToken();
    const refreshTokenObj = await RefreshToken.createToken(user._id, rememberMe === true);
    setTokenCookies(res, accessToken, refreshTokenObj.token, rememberMe === true);
    await createLog({ user: user._id, action: 'OTP_VERIFY_SUCCESS', status: 'SUCCESS', ip: req.clientIp, userAgent: req.userAgent });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register, login, refreshAccessToken, logout, logoutAll,
  getMe, updateProfile, changePassword, getProfile,
  forgotPassword, resetPassword,
  requestOtp, verifyOtp,
};