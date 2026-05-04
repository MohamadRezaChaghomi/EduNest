// backend/src/utils/sms.js

/**
 * Send SMS (placeholder - replace with actual provider like Kavenegar, Twilio, etc.)
 * @param {string} phone - Recipient phone number
 * @param {string} message - SMS text
 * @returns {Promise<boolean>} True if sent successfully (placeholder always true)
 */
const sendSms = async (phone, message) => {
  // In development, just log the SMS
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📱 [DEV SMS] To ${phone}: ${message}`);
    return true;
  }

  // TODO: Integrate with actual SMS gateway
  // Examples: Kavenegar (Iran), Twilio (International), etc.
  console.log(`📱 [SMS] To ${phone}: ${message}`);
  return true;
};

module.exports = sendSms;