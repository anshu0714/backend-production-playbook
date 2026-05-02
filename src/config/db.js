const mongoose = require("mongoose");
const { DB_URI, NODE_ENV } = require("./env");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(DB_URI, {
      autoIndex: NODE_ENV !== "production",
    });

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("DB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;