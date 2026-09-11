const mongoose = require('mongoose');

// Accept a few common spellings so a typo'd env var name doesn't cost you
// 20 minutes before a demo. Set ANY one of these in backend/.env.
const MONGO_URL =
  process.env.Mongo_url ||
  process.env.MONGO_URL ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URI;

async function connectDB() {
  if (!MONGO_URL) {
    console.error(
      '\n[FATAL] No MongoDB connection string found.\n' +
      '  Set one of Mongo_url / MONGO_URL / MONGODB_URI / MONGO_URI in backend/.env\n' +
      '  Quickest fix for a demo: create a free cluster at https://www.mongodb.com/cloud/atlas/register\n' +
      '  then copy its connection string (mongodb+srv://...) into backend/.env as:\n' +
      '    Mongo_url=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/\n'
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URL, {
      dbName: 'ghostoperator',
      serverSelectionTimeoutMS: 8000,
    });
    console.log('[OK] Connected to MongoDB Atlas');
  } catch (err) {
    console.error(
      '\n[FATAL] MongoDB connection failed:', err.message,
      '\n  Double-check: the connection string is correct, your current IP is allow-listed' +
      '\n  in Atlas Network Access (or set it to 0.0.0.0/0 for the demo), and the DB user' +
      '\n  password does not contain characters that need URL-encoding (@, #, %, etc.).\n'
    );
    process.exit(1);
  }
}

module.exports = { connectDB, mongoose };
