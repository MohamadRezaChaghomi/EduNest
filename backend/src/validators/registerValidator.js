const Validator = require('fastest-validator');

const validator = new Validator();

const registerSchema = {
  name: {
    type: 'string',
    min: 3,
    max: 50,
    optional: false,
    messages: {
      required: 'Name is required',
      string: 'Name must be a string',
      stringMin: 'Name must be at least 3 characters',
      stringMax: 'Name cannot be more than 50 characters',
    },
  },
  email: {
    type: 'email',
    optional: false,
    messages: {
      required: 'Email is required',
      email: 'Please provide a valid email address',
    },
  },
  phone: { 
    type: 'string', 
    pattern: /^[0-9]{10,15}$/, 
    optional: false, 
    messages: { 
      pattern: 'Phone must be 10-15 digits' 
    } 
  },
  password: {
    type: 'string',
    min: 6,
    max: 100,
    optional: false,
    messages: {
      required: 'Password is required',
      stringMin: 'Password must be at least 6 characters',
    },
  },
  role: {
    type: 'string',
    enum: ['user', 'instructor', 'admin'],
    optional: true,
    default: 'user',
    messages: {
      enum: 'Role must be one of: user, instructor, admin',
    },
  },
};

const validateRegister = validator.compile(registerSchema);

module.exports = validateRegister;