const mongoose = require('mongoose');

const MONGO_URL = process.env.Mongo_url;

if (!MONGO_URL) {
  throw new Error('Missing Mongo_url in .env');
}

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL, {
      dbName: 'ghostoperator',
    });
    console.log('[OK] Connected to MongoDB Atlas');
  } catch (err) {
    console.error('[ERROR] MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB, mongoose };
