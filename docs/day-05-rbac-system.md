# Authorization System (RBAC + Permission Control)

## 🔥 Core Principle

```
Authentication → "Who are you?"
Authorization → "What can you access?"
```

---

## 📁 Folder Usage

No new folders required.

We will use:

```bash
src/
├── constants/
├── middlewares/
├── models/
```

---

## 🧱 Role Constants (Single Source)

`src/constants/roles.js`

```js
const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
};

module.exports = ROLES;
```

---

## 🧱 Update User Model

`src/models/user.model.js`

Add role field:

```js
const ROLES = require("../constants/roles");

role: {
  type: String,
  enum: Object.values(ROLES),
  default: ROLES.USER,
},
```

---

## 🔐 Include Role in JWT Payload

**Update `auth.service.js`**

```js
const payload = {
  userId: user._id,
  role: user.role,
};
```

---

## 🛡️ Authorization Middleware (Critical)

`src/middlewares/authorize.middleware.js`

```js
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        const err = new Error("Unauthorized");
        err.statusCode = 401;
        throw err;
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        const err = new Error("Forbidden");
        err.statusCode = 403;
        throw err;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = authorize;
```

---

## 📁 Create Controller

`src/controllers/admin.controller.js`

```js
const getDashboard = (req, res) => {
  res.json({
    success: true,
    message: "Admin dashboard",
  });
};

module.exports = {
  getDashboard,
};
```

---

## 🔗 Protected Route Example

`src/routes/admin.routes.js`

```js
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const ROLES = require("../constants/roles");

const { getDashboard } = require("../controllers/admin.controller");

router.get("/dashboard", auth, authorize(ROLES.ADMIN), getDashboard);

module.exports = router;
```

---

## 🔗 Route Registration

**Update `src/routes/index.js`**

```js
const adminRoutes = require("./admin.routes");

router.use("/admin", adminRoutes);
```

---

## 🧠 Middleware Flow

```
Request
  ↓
Auth Middleware
  ↓
Authorization Middleware
  ↓
Controller
```

---

## 🚀 Production Practices

**Authorization Rules**

- Never trust client role
- Role must come from verified token
- Authorization always after authentication

**Access Design**

| Route Type | Access           |
| ---------- | ---------------- |
| Public     | no auth          |
| Protected  | auth only        |
| Admin      | auth + authorize |

**Future Scalability**

- Current: `Role-based access`

- Later: `Permission-based access`

---

## 🧠 My Standard Decisions

- RBAC enforced through middleware
- Role constants centralized
- JWT carries minimal auth context
- Authorization separated from auth

---

## 📌 Decision Log

**Why RBAC**

- Simple + scalable early-stage access control

**Why Middleware Authorization**

- Reusable
- Consistent across routes

**Why Role Constants**

- Avoid magic strings
- Easier refactoring

**Tradeoffs**

- RBAC less granular than permissions
- Good enough for most systems initially

---

## ⚠️ Common Mistakes

- Checking roles inside controllers
- Trusting frontend role
- Hardcoding role strings everywhere
- Combining auth + authorization
- Using user email for authorization

---

## ✅ Minimal Checklist

- [ ] roles constants created
- [ ] user model updated
- [ ] role included in JWT
- [ ] authorization middleware added
- [ ] protected admin route working
- [ ] unauthorized access blocked
