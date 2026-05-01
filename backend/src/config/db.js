const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use MONGO_URL (your .env variable) or fallback to MONGO_URI
    const dbURI = process.env.MONGO_URL || process.env.MONGO_URI;
    if (!dbURI) {
      throw new Error('MongoDB connection string is not defined in environment variables (MONGO_URL or MONGO_URI)');
    }
    const conn = await mongoose.connect(dbURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;