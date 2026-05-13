# Caching Layer (Redis + Performance Optimization)

## 📦 Install Dependencies

```bash
npm install redis
```

---

## 📁 New Structure

```bash
src/
├── config/
│   └── redis.js
│
├── utils/
│   └── cache.js
```

---

## 🔐 Environment Variables

Update `.env`

```env
REDIS_URL=redis://127.0.0.1:6379
```

Update `.env.example`

```env
REDIS_URL=redis://127.0.0.1:6379
```

Update `src/config/env.js`

```js
REDIS_URL: process.env.REDIS_URL,
```

---

## 🔌 Redis Connection

`src/config/redis.js`

```js
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
```

---

## 🚀 Connect Redis on Startup

**Update `src/server.js`**

Add:

```js
const { connectRedis } = require("./config/redis");
```

Update start function:

```js
const start = async () => {
  await connectDB();

  await connectRedis();

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};
```

---

## 🧱 Central Cache Utility

`src/utils/cache.js`

```js
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
```

---

## 🚀 Cache-Aside Pattern (IMPORTANT)

**Update `src/services/user.service.js`**

Add imports

```js
const { getCache, setCache } = require("../utils/cache");
```

Example Cached Read

```js
const getUserProfile = async (userId) => {
  const cacheKey = `user:${userId}`;

  const cachedUser = await getCache(cacheKey);

  if (cachedUser) {
    return cachedUser;
  }

  const user = await userRepo.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await setCache(cacheKey, user);

  return user;
};
```

Update `module.exports`:

```js
module.exports = {
  registerUser,
  getUserProfile,
};
```

---

## 🔗 Profile Route (Cache Demonstration)

**Update `src/controllers/user.controller.js`**

Add:

```js
const getProfile = catchAsync(async (req, res) => {
  const user = await userService.getUserProfile(req.user.userId);

  res.json({
    success: true,
    data: user,
  });
});

module.exports = {
  register,
  getProfile,
};
```

**Update `src/routes/user.routes.js`**

```js
const auth = require("../middlewares/auth.middleware");

router.get("/me", auth, getProfile);
```

---

## 🔥 Cache Invalidation Strategy

When user updates profile:

```js
await deleteCache(`user:${userId}`);
```

---

## 🧠 Caching Rules

Cache:

- frequently read data
- expensive queries
- stable responses

Do NOT Cache:

- sensitive auth data
- rapidly changing data
- admin-critical operations

---

## 🚀 Production Practices

**Key Naming Convention**

```
user:123
product:456
posts:homepage
```

**TTL Strategy**

| Data          | TTL    |
| ------------- | ------ |
| user profile  | 5 min  |
| dashboard     | 1 min  |
| static config | 1 hour |

**Failure Strategy**

If Redis fails:

- app should still work
- cache is optimization only

---

## 🧠 My Standard Decisions

- Redis as external cache
- cache-aside pattern
- centralized cache utility
- short-lived cache TTLs

---

## 📌 Decision Log

**Why Redis**

- extremely fast
- battle-tested
- simple integration

**Why Cache-Aside**

- app controls caching
- flexible invalidation

**Why Utility Layer**

- Avoid:
  - duplicated cache logic
  - inconsistent serialization

**Tradeoffs**

- cache invalidation complexity
- eventual consistency

---

## ⚠️ Common Mistakes

- caching everything
- no TTL
- inconsistent cache keys
- forgetting invalidation
- app crashing when Redis fails

---

## ✅ Minimal Checklist

- [ ] redis installed
- [ ] redis connection setup
- [ ] cache utility created
- [ ] cache-aside pattern implemented
- [ ] cache invalidation added
- [ ] key naming convention followed
- [ ] Redis startup connected
