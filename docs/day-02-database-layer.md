# 📦 DAY 2 — Database Layer (Production Data Access System)

## 📁 Folder Additions

```bash
touch src/config/db.js
```

---

## ⚙️ Install

```bash
npm install mongoose
```

---

## 🔐 Env and Env Example Update

```env
DB_URI=mongodb://127.0.0.1:27017/backend-playbook
```

---

## 🧩 Update `config/env`

```js
require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_URI: process.env.DB_URI,
};
```

---

## 🔌 DB Connection (Fail Fast + Clean Logs)

`src/config/db.js`

```js
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
    process.exit(1); // fail fast
  }
};

module.exports = connectDB;
```

---

## 🚀 Server Bootstrap (Block on DB)

```js
const app = require("./app");
const { PORT } = require("./config/env");
const connectDB = require("./config/db");

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
};

start();
```

---

## 🧱 Model Standard (Lean + Indexed)

`src/models/user.model.js`

```js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("User", userSchema);
```

---

## 🗃️ Repository Layer (Only DB Access)

**Rules**

- Only pure DB ops
- No business logic
- Return minimal data

`src/repositories/user.repository.js`

```js
const User = require("../models/user.model");

const create = (payload) => {
  return User.create(payload);
};

const findByEmail = (email) => {
  return User.findOne({ email }).select("_id email name").lean();
};

const findById = (id) => {
  return User.findById(id).select("_id email name").lean();
};

module.exports = {
  create,
  findByEmail,
  findById,
};
```

---

## 🧠 Service Layer (Orchestration Only)

`src/services/user.service.js`

```js
const userRepo = require("../repositories/user.repository");

const registerUser = async (payload) => {
  const email = payload.email.toLowerCase();

  const exists = await userRepo.findByEmail(email);

  if (exists) {
    const err = new Error("Email already registered");
    err.statusCode = 400;
    throw err;
  }

  const user = await userRepo.create({
    ...payload,
    email,
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

## 🎯 Controller (Thin)

`src/controllers/user.controller.js`

```js
const userService = require("../services/user.service");

const register = async (req, res, next) => {
  try {
    const data = await userService.registerUser(req.body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register };
```

---

## 🔗 Routes

`src/routes/user.routes.js`

```js
const express = require("express");
const router = express.Router();

const { register } = require("../controllers/user.controller");

router.post("/register", register);

module.exports = router;
```

Update `src/routes/index.js`

```js
const express = require("express");
const router = express.Router();

const userRoutes = require("./user.routes");

router.get("/", (req, res) => {
  res.json({ message: "API running" });
});

router.use("/users", userRoutes);

module.exports = router;
```

---

## 🚀 Production Practices (DB)

**Connection**

- App must NOT start if DB fails
- Log once, exit

**Queries**

- Use `.lean()` for reads
- Always index unique fields
- Avoid returning full docs

**Data Safety**

- Normalize inputs (lowercase email)
- Never trust client payload

---

## 🧠 My Standard Decisions

- DB: MongoDB + Mongoose
- Pattern: Repository enforced
- Reads: .lean() default
- Models: schema-only (no logic)

---

## 📌 Decision Log

**Why Mongoose**

- Fast to ship
- Schema + validation built-in

**Why Repository Layer**

- Decouples DB from business logic
- Easier to swap DB later

**Why `.lean()`**

- Faster reads
- Lower memory footprint

**Tradeoffs**

- Less flexibility with document methods (acceptable)

---

## ⚠️ Common Mistakes

- Using models in controllers ❌
- Skipping indexes ❌
- Returning full documents ❌
- No fail-fast DB connection ❌
- Business logic inside repository ❌

---

## ✅ Minimal Checklist

- [ ] mongoose installed
- [ ] DB connected before server start
- [ ] model created
- [ ] repository layer added
- [ ] service uses repository
- [ ] controller clean
- [ ] route working (/api/users/register)
