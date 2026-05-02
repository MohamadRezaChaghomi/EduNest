const Contact = require('../models/Contact');
const nodemailer = require('nodemailer'); // فرض می‌کنیم nodemailer قبلاً تنظیم شده

// ارسال پیام از طرف کاربر
exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const contact = await Contact.create({ name, email, subject, message });
    // (اختیاری) ارسال ایمیل به ادمین
    // sendEmailToAdmin(name, email, subject, message);
    res.status(201).json({ message: 'پیام شما با موفقیت ارسال شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// دریافت پیام‌ها (فقط ادمین)
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort('-createdAt');
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// علامت خوانده شدن
exports.markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'پیام پیدا نشد' });
    contact.isRead = true;
    await contact.save();
    res.json({ message: 'وضعیت به روز شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};