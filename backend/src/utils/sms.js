/**
 * Send SMS (placeholder - replace with actual provider like Kavenegar, Twilio, etc.)
 * @param {string} phone - recipient phone number
 * @param {string} message - SMS text
 */
const sendSms = async (phone, message) => {
  console.log(`[SMS] To ${phone}: ${message}`);
  return true;
};

module.exports = sendSms;