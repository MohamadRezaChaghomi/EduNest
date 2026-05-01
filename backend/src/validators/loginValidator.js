const Validator = require('fastest-validator');
const validator = new Validator();

const loginSchema = {
  identifier: { type: 'string', optional: false, messages: { required: 'Email or phone is required' } },
  password: { type: 'string', min: 6, optional: false },
};

const validateLogin = validator.compile(loginSchema);
module.exports = validateLogin;