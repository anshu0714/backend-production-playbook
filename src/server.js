const app = require("./app");

const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");

const { PORT } = require("./config/env");

const logger = require("./utils/logger");

const start = async () => {
  await connectDB();

  await connectRedis();

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection", {
    error: err.message,
    stack: err.stack,
  });

  setTimeout(() => {
    process.exit(1);
  }, 100);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", {
    error: err.message,
    stack: err.stack,
  });

  setTimeout(() => {
    process.exit(1);
  }, 100);
});

start();
