const logger = require("./logger");

const { redisClient } = require("../config/redis");

const DEFAULT_EXPIRY = 60 * 5;

const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);

    return data ? JSON.parse(data) : null;
  } catch (err) {
    logger.warn("Cache get failed", {
      key,
      error: err.message,
    });

    return null;
  }
};

const setCache = async (key, value, expiry = DEFAULT_EXPIRY) => {
  try {
    await redisClient.setEx(key, expiry, JSON.stringify(value));
  } catch (err) {
    logger.warn("Cache set failed", {
      key,
      error: err.message,
    });

    return null;
  }
};

const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (err) {
    logger.warn("Cache delete failed", {
      key,
      error: err.message,
    });

    return null;
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
};
