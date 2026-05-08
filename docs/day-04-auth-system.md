# 📦 Authentication System (JWT + Access/Refresh Tokens)

## 📦 Install Dependencies

```bash
npm install jsonwebtoken bcryptjs
```

---

## 🔐 Env Configuration

**Add in `.env` and `.env.example`**

```env
JWT_ACCESS_SECRET=access_secret_key
JWT_REFRESH_SECRET=refresh_secret_key

JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

**Update `src/config/env.js`**

```js
require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_URI: process.env.DB_URI,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY,
};
```

---

## 🧱 Token Utility (Centralized)

`src/utils/token.js`

```js
const jwt = require("jsonwebtoken");
const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
} = require("../config/env");

const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_ACCESS_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
};
```

---

## 🔑 Password Hashing (Critical)

**Update `user.service.js`**

```js
const bcrypt = require("bcryptjs");
const userRepo = require("../repositories/user.repository");

const registerUser = async (payload) => {
  const exists = await userRepo.findByEmail(payload.email);

  if (exists) {
    const err = new Error("Email already registered");
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await userRepo.create({
    ...payload,
    password: hashedPassword,
  });

  return {
    id: user._id,
    email: user.email,
    name: user.name,
  };
};

module.exports = {
  registerUser,
};
```

---

## 🧱 Update Model (Add Password)

`src/models/user.model.js`

```js
password: {
  type: String,
  required: true,
  select: false,
},
```

---

## 🔐 Login Service

`src/services/auth.service.js`

```js
const bcrypt = require("bcryptjs");
const userRepo = require("../repositories/user.repository");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");

const loginUser = async ({ email, password }) => {
  const user = await userRepo.findByEmailWithPassword(email);

  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 400;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password || "");

  if (!isMatch) {
    const err = new Error("Invalid credentials");
    err.statusCode = 400;
    throw err;
  }

  const payload = { userId: user._id };

  return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

module.exports = {
  loginUser,
};
```

---

## ⚠️ Add method in repository

`src/repositories/user.repository.js`

```js
const findByEmailWithPassword = (email) => {
  return User.findOne({ email }).select("+password");
};
```

**Update `module.exports`**

```js
module.exports = {
  create,
  findByEmail,
  findByEmailWithPassword,
  findById,
};
```

---

## 🎯 Auth Controller

`src/controllers/auth.controller.js`

```js
const authService = require("../services/auth.service");

const login = async (req, res, next) => {
  try {
    const tokens = await authService.loginUser(req.body);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login };
```

---

## ✅ Auth validator

`src/validators/auth.validator.js`

```js
const { z } = require("zod");

const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6).max(20),
  })
  .strict();

module.exports = {
  loginSchema,
};
```

**Update `src/validators/user.validator.js`**

```js
const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    name: z.string().trim().min(2).max(50),
    password: z.string().min(6).max(20),
  })
  .strict();
```

---

## 🔗 Routes

`src/routes/auth.routes.js`

```js
const express = require("express");
const router = express.Router();

const { login } = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const { loginSchema } = require("../validators/auth.validator");

router.post("/login", validate(loginSchema), login);

module.exports = router;
```

**Update `routes/index.js`**

```js
const authRoutes = require("./auth.routes");

router.use("/auth", authRoutes);
```

---

## 🛡️ Auth Middleware (Protect Routes)

`src/middlewares/auth.middleware.js`

```js
const { verifyAccessToken } = require("../utils/token");

const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      const err = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }

    const token = header.split(" ")[1];

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (err) {
    const error = new Error("Invalid or expired token");
    error.statusCode = 401;

    next(error);
  }
};

module.exports = auth;
```

---

## 🧠 Flow

```
Register → Hash Password → Store
Login → Verify Password → Issue Tokens
Protected Route → Verify Access Token
```

---

## 🚀 Production Practices

**Token Strategy**

- Access → short-lived
- Refresh → long-lived

**Security**

- Never store password plain
- Never expose password in response
- Always hash with salt

**Future Upgrade**

- Store refresh tokens in DB (Day 5+)

---

## 🧠 My Standard Decisions

- Auth: JWT (stateless)
- Password: bcrypt
- Tokens: access + refresh split
- Middleware-based protection

---

## 📌 Decision Log

**Why JWT**

- Stateless
- Scales horizontally

**Why Access + Refresh**

- Security + usability balance

**Why bcrypt**

- Industry standard hashing

**Tradeoffs**

- Token revocation complexity
- Needs refresh token strategy later

---

## ⚠️ Common Mistakes

- Storing plain passwords
- Not selecting password field
- Long-lived access tokens
- No auth middleware
- Exposing secrets

---

## ✅ Minimal Checklist

- [ ] bcrypt implemented
- [ ] password hashed on register
- [ ] login endpoint working
- [ ] JWT tokens generated
- [ ] auth middleware added
- [ ] protected route testable
