// backend/src/controllers/adminController.js

const crypto = require('crypto');
const User = require('../models/User');
const BannedUser = require('../models/BannedUser');
const RefreshToken = require('../models/RefreshToken');
const Log = require('../models/Log');
const OTP = require('../models/OTP');
const { createLog } = require('../utils/logger');
const sendSms = require('../utils/sms');

// ---------- Helper: Set JWT cookies ----------
const setTokenCookies = (res, accessToken, refreshToken, rememberMe = false) => {
  const accessMaxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const refreshMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: accessMaxAge,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: refreshMaxAge,
  });
};

// ---------- Get all users with ban status (paginated) ----------
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const bans = await BannedUser.find({ user: { $in: users.map(u => u._id) } }).populate('bannedBy', 'name email');
    const banMap = {};
    bans.forEach(ban => { banMap[ban.user.toString()] = ban; });

    const usersWithBan = users.map(user => ({
      ...user.toObject(),
      isBanned: !!banMap[user._id.toString()],
      banInfo: banMap[user._id.toString()] || null,
    }));

    const total = await User.countDocuments(filter);
    res.json({
      success: true,
      data: usersWithBan,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Ban user by ID ----------
const banUser = async (req, res) => {
  try {
    const { reason, expiresAt } = req.body;
    const userId = req.params.id;
    const adminId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const existingBan = await BannedUser.findOne({ user: userId });
    if (existingBan) {
      return res.status(400).json({ success: false, message: 'User is already banned.' });
    }

    let expiryDate = null;
    if (expiresAt) {
      expiryDate = new Date(expiresAt);
      if (isNaN(expiryDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid expiry date.' });
      }
    }

    const ban = await BannedUser.create({
      user: userId,
      reason: reason || 'No reason provided',
      bannedBy: adminId,
      expiresAt: expiryDate,
    });

    await RefreshToken.deleteMany({ user: userId });

    await createLog({
      user: userId,
      action: 'USER_BANNED',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
      details: { reason, expiresAt },
      performedBy: adminId,
    });

    res.status(201).json({
      success: true,
      message: 'User banned successfully.',
      ban,
    });
  } catch (error) {
    console.error('Error in banUser:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Unban user ----------
const unbanUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const adminId = req.user.id;

    const deleted = await BannedUser.findOneAndDelete({ user: userId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User is not banned.' });
    }

    await createLog({
      user: userId,
      action: 'USER_UNBANNED',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
      performedBy: adminId,
    });

    res.json({ success: true, message: 'User unbanned successfully.' });
  } catch (error) {
    console.error('Error in unbanUser:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Permanently delete user and all related data ----------
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const adminId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await BannedUser.findOneAndDelete({ user: userId });
    await RefreshToken.deleteMany({ user: userId });
    await Log.deleteMany({ user: userId });
    await user.deleteOne();

    await createLog({
      user: userId,
      action: 'USER_DELETED',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
      performedBy: adminId,
    });

    res.json({ success: true, message: 'User and all related data deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Change user role (user, instructor, admin) ----------
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;
    const adminId = req.user.id;

    if (!['user', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await createLog({
      user: userId,
      action: 'ROLE_CHANGE',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
      details: { oldRole, newRole: role },
      performedBy: adminId,
    });

    res.json({
      success: true,
      message: `User role updated to ${role}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in changeUserRole:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Get audit logs with filtering and pagination ----------
const getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.action) filter.action = req.query.action;
    if (req.query.user) filter.user = req.query.user;
    if (req.query.status) filter.status = req.query.status;

    const logs = await Log.find(filter)
      .populate('user', 'name email')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Log.countDocuments(filter);

    res.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error in getLogs:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Helper: Check if a user is currently banned (respects expiry) ----------
const isUserBanned = async (userId) => {
  const ban = await BannedUser.findOne({ user: userId });
  if (!ban) return false;
  if (ban.expiresAt && ban.expiresAt < new Date()) {
    await BannedUser.deleteOne({ _id: ban._id });
    return false;
  }
  return true;
};

// ---------- Request OTP (for phone login) ----------
const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }

    await OTP.deleteMany({ phone, verified: false });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.create({
      phone,
      code,
      expiresAt,
      attempts: 0,
      verified: false,
    });

    const message = `Your verification code for EduNest is: ${code}. Valid for 5 minutes.`;
    await sendSms(phone, message);

    await createLog({
      action: 'REQUEST_OTP',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
      details: { phone },
    });

    res.json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('Error in requestOtp:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

// ---------- Verify OTP and login/register user ----------
const verifyOtp = async (req, res) => {
  try {
    const { phone, code, rememberMe } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: 'Phone number and code are required.' });
    }

    const otpRecord = await OTP.findOne({ phone, code, verified: false });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      if (otpRecord) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        if (otpRecord.attempts >= 5) {
          await OTP.deleteOne({ _id: otpRecord._id });
        }
      }
      return res.status(400).json({ success: false, message: 'Invalid or expired code.' });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

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

    const accessToken = user.getSignedJwtToken();
    const refreshTokenObj = await RefreshToken.createToken(user._id, rememberMe === true);
    setTokenCookies(res, accessToken, refreshTokenObj.token, rememberMe === true);

    await createLog({
      user: user._id,
      action: 'OTP_VERIFY_SUCCESS',
      status: 'SUCCESS',
      ip: req.clientIp || req.ip,
      userAgent: req.userAgent || req.headers['user-agent'],
      details: { phone, newUser: !user.email.startsWith('temp') ? 'existing' : 'new' },
    });

    res.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    res.status(500).json({ success: false, message: 'Internal server error. Please try again.' });
  }
};

module.exports = {
  getAllUsers,
  banUser,
  unbanUser,
  deleteUser,
  changeUserRole,
  getLogs,
  isUserBanned,
  requestOtp,
  verifyOtp,
};