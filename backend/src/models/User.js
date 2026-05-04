// backend/src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * User Schema
 * Role-based access: user, instructor, admin
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      unique: true,
      sparse: true, // allows multiple null/empty values but enforces uniqueness for non-empty
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // exclude from queries by default
    },
    role: {
      type: String,
      enum: ['user', 'instructor', 'admin'],
      default: 'user',
      index: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for filtering active users by role
userSchema.index({ role: 1, isActive: 1 });

/**
 * Hash password before saving
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compare entered password with stored hash
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate JWT access token
 * @returns {string} Signed JWT token
 */
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

/**
 * Virtual: User's full display name (alias for name)
 */
userSchema.virtual('fullName').get(function () {
  return this.name;
});

/**
 * Virtual: User's profile image URL with fallback
 */
userSchema.virtual('avatar').get(function () {
  return this.profileImage || 'https://ui-avatars.com/api/?background=0D9488&color=fff&name=' + encodeURIComponent(this.name);
});

module.exports = mongoose.model('User', userSchema);