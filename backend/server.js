const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });