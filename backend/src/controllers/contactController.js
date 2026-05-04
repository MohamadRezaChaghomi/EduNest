// backend/src/controllers/contactController.js

const Contact = require('../models/Contact');
// Optional: uncomment if you want to send email to admin
// const { sendContactEmail } = require('../utils/email');

/**
 * Submit a contact message from user
 */
exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, subject, message) are required.',
      });
    }

    const contact = await Contact.create({ name, email, subject, message });

    // Optional: send email notification to admin
    // await sendContactEmail({ name, email, subject, message });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully.',
      data: { id: contact._id },
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Get all contact messages (Admin only)
 */
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort('-createdAt');

    res.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};

/**
 * Mark a contact message as read (Admin only)
 */
exports.markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.',
      });
    }

    contact.isRead = true;
    await contact.save();

    res.json({
      success: true,
      message: 'Message marked as read.',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
};