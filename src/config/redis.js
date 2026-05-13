const { createClient } = require("redis");

const logger = require("../utils/logger");

const { REDIS_URL } = require("./env");

const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        return false;
      }

      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on("error", (err) => {
  logger.warn("Redis Error", {
    error: err.message,
  });
});

redisClient.on("connect", () => {
  logger.info("Redis connected successfully");
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.warn("Redis unavailable, continuing without cache");
  }
};

module.exports = {
  redisClient,
  connectRedis,
};
