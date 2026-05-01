# 📦 DAY 1 - Backend Production Setup Playbook

## Backend Project Setup Guide

### 1. Create Repo (GitHub)

- Name: `backend-[project-name]`

### 2. Clone Repository

```bash
git clone https://github.com/<username>/backend-project.git
cd backend-project
```

### 3. Initialize Project

```bash
npm init -y
```

### 4. Initialize Git (if not auto)

```bash
git init
```

### 5. Create Base Files

```bash
touch .gitignore README.md .env .env.example
mkdir logs src
```

### 6. Add Standard Ignores

```bash
echo "node_modules
.env
dist
logs" > .gitignore
```

### 7. First Commit

```bash
git add .
git commit -m "chore: initial project setup"
```

### 8. Setup Main Branch

```bash
git branch -M main
git push -u origin main
```

---

## ⚙️ Initial Setup (Command-Level)

### Install Core Dependencies

```bash
npm install express dotenv cors helmet morgan
```

### Install Dev Dependencies

```bash
npm install --save-dev nodemon
```

### Create Folder Structure

```bash
mkdir src/config src/controllers src/services src/routes src/middlewares src/utils src/validators src/constants src/repositories
```

### Create Core Files

```bash
touch src/app.js src/server.js src/config/env.js
```

---

## 📁 Folder Structure (Production Standard)

```bash
src/
│
├── config/            # env, db, app config
├── controllers/       # request handling (thin)
├── services/          # business logic
├── repositories/      # DB queries (optional / future use)
├── routes/            # route definitions
├── middlewares/       # custom middleware
├── utils/             # helpers (logger, errors)
├── validators/        # request validation schemas
├── constants/         # enums, constants
│
├── app.js             # express app config
└── server.js          # entry point

logs/                  # runtime logs
tests/                 # (later)
.env
.gitignore
package.json
```

---

## 📦 Core Dependencies (Real-world Only)

| Package | Purpose               |
| ------- | --------------------- |
| express | HTTP server           |
| dotenv  | env config            |
| cors    | cross-origin handling |
| helmet  | security headers      |
| morgan  | request logging       |
| nodemon | dev auto-restart      |

---

## 🧩 Boilerplate Code (Reusable)

`src/config/env.js`

```js
require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
};
```

`src/app.js`

```js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

// Security
app.use(helmet());

// CORS
app.use(cors());

// Body parser
app.use(express.json({ limit: "10kb" }));

// Logging
app.use(morgan("combined"));

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Error handler (last)
app.use(errorMiddleware);

module.exports = app;
```

`src/server.js`

```js
const app = require("./app");
const { PORT } = require("./config/env");

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

`src/routes/index.js`

```js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "API working" });
});

module.exports = router;
```

`src/middlewares/error.middleware.js`

```js
module.exports = (err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
```

---

## 🔐 Environment Configuration

`.env`

```env
PORT=5000
NODE_ENV=development
```

`.env.example`

```env
PORT=5000
NODE_ENV=development
```

**Rule**:

- NEVER access `process.env` directly outside `config/`
- Always import from `config/env.js`

## 🚀 Production Practices (Critical)

**Logging**

- Use morgan for HTTP logs
- Later: replace with structured logger (winston/pino)

**Security**

- Always use helmet
- Restrict CORS in production

**Validation**

- Use schema validation (Zod / Joi)
- Validate before controller

**Error Handling**

- Centralized error middleware only
- Never send raw errors

**Folder Responsibility**

| Layer      | Responsibility         |
| ---------- | ---------------------- |
| Controller | req/res only           |
| Service    | business logic         |
| Repository | DB logic               |
| Middleware | cross-cutting concerns |

---

## 🧠 My Standard Decisions

- Architecture: MVC + Service Layer
- Controllers are thin (no logic)
- Services handle core logic
- Routes only map endpoints
- Config centralized
- No direct DB calls in controllers
- Naming Conventions:
  - controllers → `user.controller.js`
  - services → `user.service.js`
  - routes → `user.routes.js`
  - middlewares → `auth.middleware.js`

---

## 📌 Decision Log (Engineering Thinking)

**Why Express**

- Minimal, flexible, widely adopted
- No lock-in, full control

**Why MVC + Service Layer**

- Separates concerns cleanly
- Easier scaling & testing

**Why Service Layer**

- Keeps controllers clean
- Business logic reusable

**Why Config Layer**

- Avoid env sprawl
- Central control for environments

**Tradeoffs**

- Slight initial setup overhead
- More files → better long-term clarity

---

## ⚠️ Common Mistakes to Avoid

- Fat controllers (logic inside routes)
- Accessing process.env everywhere
- No error middleware
- No folder structure (flat chaos)
- Mixing DB logic in services/controllers
- Skipping validation
- No health route

---

## ✅ Minimal Checklist

- [ ] Repo initialized
- [ ] Folder structure created
- [ ] Express app setup
- [ ] Middleware added (helmet, cors, morgan)
- [ ] Error handler added
- [ ] Env config centralized
- [ ] Base route working
- [ ] Health check route added
- [ ] Naming conventions followed
