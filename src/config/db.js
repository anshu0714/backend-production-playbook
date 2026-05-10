const mongoose = require("mongoose");

const { DB_URI, NODE_ENV } = require("./env");

const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(DB_URI, {
      autoIndex: NODE_ENV !== "production",
    });

    logger.info("MongoDB connected successfully");
  } catch (err) {
    logger.error("DB connection failed", {
      error: err.message,
      stack: err.stack,
    });

    setTimeout(() => {
      process.exit(1);
    }, 100);
  }
};

module.exports = connectDB;
