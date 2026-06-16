const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.MONGODB_URI === 'mock') {
    console.log('Using Virtual In-Memory Database for automated testing...');
    require('../utils/mongoose_mock')();
    await mongoose.connect();
    return;
  }

  try {
    // Attempt connecting to the configured MongoDB connection URI
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/url_shortener_pro', {
      serverSelectionTimeoutMS: 3000 // Quick timeout (3s) to fall back fast if MongoDB is not running
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`\n[WARNING] Could not connect to MongoDB: ${error.message}`);
    console.warn('Falling back to Virtual In-Memory Database for local development and review...\n');
    
    // Load virtual database in memory
    require('../utils/mongoose_mock')();
    await mongoose.connect();
  }
};

module.exports = connectDB;
