const mongoose = require('mongoose');
const db = process.env.MONGO_URI;
const dbName = 'ScrepWebApp';

const connectDB = async () => {
  try {
    await mongoose.connect(db, { dbName });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};


module.exports = connectDB;
