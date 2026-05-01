const Validator = require('fastest-validator');

const validator = new Validator();

const loginSchema = {
  email: {
    type: 'email',
    optional: false,
    messages: {
      required: 'Email is required',
      email: 'Please provide a valid email address',
    },
  },
  password: {
    type: 'string',
    min: 6,
    optional: false,
    messages: {
      required: 'Password is required',
      stringMin: 'Invalid credentials',
    },
  },
};

const validateLogin = validator.compile(loginSchema);

module.exports = validateLogin;