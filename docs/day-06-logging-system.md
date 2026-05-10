# 📦 Logging System (Structured Production Logging)

## 📦 Install Dependencies

```bash
npm install winston
```

---

## 📁 Logging Structure

```bash
src/
├── utils/
│   └── logger.js
│
logs/
├── error.log
├── combined.log
```

---

## 🧱 Create Central Logger

`src/utils/logger.js`

```js
const fs = require("fs");
const path = require("path");
const winston = require("winston");
const { NODE_ENV } = require("../config/env");

const logDir = path.join(__dirname, "../../logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: NODE_ENV === "production" ? "info" : "debug",

  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),

  defaultMeta: {
    service: "backend-production-playbook",
  },

  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
    }),

    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

if (NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

module.exports = logger;
```

---

## 🔁 Replace Console Logs

**REMOVE**

```js
console.log();
console.error();
```

**USE**

```js
const logger = require("../utils/logger");

logger.info("Server started");

logger.error("DB connection failed");
```

---

## 🔌 Update DB Connection

`src/config/db.js`

```js
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
```

---

## 🚀 Update Server Startup

`src/server.js`

```js
const app = require("./app");

const connectDB = require("./config/db");

const { PORT } = require("./config/env");

const logger = require("./utils/logger");

const start = async () => {
  await connectDB();

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
```

---

## 🛡️ Update Error Middleware

`src/middlewares/error.middleware.js`

```js
const logger = require("../utils/logger");

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    logger.error(err.message, {
      stack: err.stack,
      method: req.method,
      path: req.originalUrl,
    });
  } else {
    logger.warn(err.message, {
      method: req.method,
      path: req.originalUrl,
    });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
```

---

## 🌐 Improve Morgan Logging

**Update `src/app.js`**

Add Import:

```js
const logger = require("./utils/logger");
```

Replace:

```js
app.use(morgan("combined"));
```

With:

```js
app.use(
  morgan(":method :url :status :response-time ms - :res[content-length]", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }),
);
```

---

## 🚀 Production Logging Practices

**What To Log**

| Type             | Log? |
| ---------------- | ---- |
| server startup   | ✅   |
| DB connection    | ✅   |
| failed auth      | ✅   |
| unhandled errors | ✅   |
| request metadata | ✅   |

**What NOT To Log**

| Sensitive Data | Reason        |
| -------------- | ------------- |
| passwords      | security risk |
| JWT secrets    | critical leak |
| full tokens    | dangerous     |
| DB URIs        | security      |

---

## 🧠 My Standard Decisions

- Winston for app logs
- Morgan for HTTP logs
- Structured JSON logs
- Centralized logger utility
- No raw console logs in production

---

## 📌 Decision Log

**Why Winston**

- Mature ecosystem
- Multiple transports
- Structured logging

**Why Structured Logs**

- Makes logs:
  - searchable
  - parsable
  - monitoring-friendly

**Why Central Logger**

- Avoid:
  - inconsistent logs
  - duplicated setup
  - uncontrolled output

**Tradeoffs**

- Slight setup complexity
- Worth it immediately in production

---

## ⚠️ Common Mistakes

- Logging passwords
- Using only console.log
- No request metadata
- Unstructured logs
- Logging sensitive env variables

---

## ✅ Minimal Checklist

- [ ] winston installed
- [ ] logger utility created
- [ ] DB logs centralized
- [ ] server logs centralized
- [ ] error middleware logging added
- [ ] morgan integrated with winston
- [ ] logs folder created
