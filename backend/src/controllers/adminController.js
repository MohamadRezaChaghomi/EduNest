const User = require('../models/User');
const BannedUser = require('../models/BannedUser');
const RefreshToken = require('../models/RefreshToken');
const Log = require('../models/Log');
const { createLog } = require('../utils/logger');

// ---------- Get all users (with ban status) ----------
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Ban user ----------
const banUser = async (req, res) => {
  try {
    const { reason, expiresAt } = req.body;
    const userId = req.params.id;
    const adminId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existingBan = await BannedUser.findOne({ user: userId });
    if (existingBan) return res.status(400).json({ message: 'User is already banned' });

    const ban = await BannedUser.create({
      user: userId,
      reason: reason || 'No reason provided',
      bannedBy: adminId,
      expiresAt: expiresAt || null,
    });

    // Revoke all refresh tokens of banned user
    await RefreshToken.deleteMany({ user: userId });

    await createLog({
      user: userId,
      action: 'USER_BANNED',
      status: 'SUCCESS',
      ip: req.clientIp,
      userAgent: req.userAgent,
      details: { reason, expiresAt },
      performedBy: adminId,
    });

    res.status(201).json({ success: true, message: 'User banned successfully', ban });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Unban user ----------
const unbanUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const adminId = req.user.id;
    const deleted = await BannedUser.findOneAndDelete({ user: userId });
    if (!deleted) return res.status(404).json({ message: 'User is not banned' });

    await createLog({
      user: userId,
      action: 'USER_UNBANNED',
      status: 'SUCCESS',
      ip: req.clientIp,
      userAgent: req.userAgent,
      performedBy: adminId,
    });

    res.json({ success: true, message: 'User unbanned successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Delete user (permanent) ----------
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const adminId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove related data
    await BannedUser.findOneAndDelete({ user: userId });
    await RefreshToken.deleteMany({ user: userId });
    await Log.deleteMany({ user: userId });
    await user.deleteOne();

    await createLog({
      user: userId,
      action: 'USER_DELETED',
      status: 'SUCCESS',
      ip: req.clientIp,
      userAgent: req.userAgent,
      performedBy: adminId,
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Change user role ----------
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;
    const adminId = req.user.id;
    if (!['user', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await createLog({
      user: userId,
      action: 'ROLE_CHANGE',
      status: 'SUCCESS',
      ip: req.clientIp,
      userAgent: req.userAgent,
      details: { oldRole, newRole: role },
      performedBy: adminId,
    });

    res.json({ success: true, message: `Role updated to ${role}`, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ---------- Get audit logs (admin only) ----------
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper to check ban status
const isUserBanned = async (userId) => {
  const ban = await BannedUser.findOne({ user: userId });
  if (!ban) return false;
  if (ban.expiresAt && ban.expiresAt < new Date()) {
    await BannedUser.deleteOne({ _id: ban._id });
    return false;
  }
  return true;
};

module.exports = { getAllUsers, banUser, unbanUser, deleteUser, changeUserRole, getLogs, isUserBanned };