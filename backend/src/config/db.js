const mongoose = require("mongoose");
const logger   = require("./logger");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error("MongoDB connection failed:", err.message);
    //Kills the Node process with error code 1
    process.exit(1);
  }
} 

module.exports = connectDB;