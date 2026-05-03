# 📦 DAY 3 — Validation Layer (Request Integrity System)

## 📦 Install Dependency

```bash
npm install zod
```

---

## 📁 Folder (Already Created)

```bash
src/validators/
```

---

## 🧱 Validation Schema (Zod Standard)

`src/validators/user.validator.js`

```js
const { z } = require("zod");

const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    name: z.string().trim().min(2).max(50),
  })
  .strict();

module.exports = {
  registerSchema,
};
```

---

## 🔁 Validation Middleware (Reusable)

`src/middlewares/validate.middleware.js`

```js
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    const message =
      err.issues?.map((e) => e.message).join(", ") || "Invalid request data";

    const error = new Error(message);
    error.statusCode = 400;

    next(error);
  }
};

module.exports = validate;
```

---

## 🔗 Route Integration (Enforce Before Controller)

**Update `src/routes/user.routes.js`**

```js
const express = require("express");
const router = express.Router();

const { register } = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const { registerSchema } = require("../validators/user.validator");

router.post("/register", validate(registerSchema), register);

module.exports = router;
```

---

## 🧠 Validation Strategy (Strict Rules)

**Placement**
`Route → Validation → Controller → Service`

**Rules**

- No validation in controllers
- No validation in services
- Always validate at route level
- Reject request immediately if invalid

---

## 🚀 Production Practices

**Sanitization**

- Trim strings
- Normalize emails

**Error Consistency**
Always return:

```json
{
  "success": false,
  "message": "error message"
}
```

---

## 🧠 My Standard Decisions

- Library: Zod
- Validation location: Middleware
- Fail early before controller
- Clean parsed data → passed forward

---

## 📌 Decision Log

**Why Zod**

- Simple + readable schemas
- Built-in parsing + validation
- No separate schema + validator

**Why Middleware Validation**

- Keeps controllers clean
- Reusable across routes

**Why Early Rejection**

- Saves compute
- Prevents invalid data flow

**Tradeoffs**

- Slight boilerplate per route

---

## ⚠️ Common Mistakes

- Validating inside controllers
- Trusting client payload
- Skipping sanitization
- Returning raw Zod errors
- Not reassigning parsed data

---

## ✅ Minimal Checklist

- [ ] zod installed
- [ ] schema created
- [ ] validation middleware added
- [ ] route validation applied
- [ ] invalid requests rejected
- [ ] sanitized data flowing forward
