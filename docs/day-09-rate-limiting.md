# 📦 DAY 9 — Rate Limiting + Security Hardening

## 📦 Install Dependencies

```bash
npm install express-rate-limit hpp
```

---

## 📁 Folder Structure

No new folders required.

```bash
src/
├── middlewares/
├── config/
├── app.js
```

---

## 🚦 Rate Limiting

**Create Middleware**

`src/middlewares/rateLimit.middleware.js`

```js
const rateLimit = require("express-rate-limit");

const AppError = require("../utils/appError");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  standardHeaders: true,

  legacyHeaders: false,

  handler: (req, res, next) => {
    next(new AppError("Too many requests. Please try again later.", 429));
  },
});

module.exports = apiLimiter;
```

---

## 🔒 Apply Rate Limiting

**Update `src/app.js`**

```js
const apiLimiter = require("./middlewares/rateLimit.middleware");
```

Apply before routes:

```js
app.use("/api", apiLimiter);
```

---

## 📏 Request Size Limiting

Already have:

```js
app.use(express.json({ limit: "10kb" }));
```

This prevents:

- Huge Payload Attack
- Memory Exhaustion
- Large JSON Abuse

---

## 🛡️ HTTP Parameter Pollution Protection

**Update `app.js`**

```js
const hpp = require("hpp");
```

```js
app.use(hpp());
```

**Attack Example**

Without protection:

```bash
/api/users?id=1&id=2&id=3
```

Can cause unexpected behavior.

`hpp()` prevents this.

---

## 🔥 XSS Protection

XSS is primarily mitigated by:

- React escaping output
- Input validation
- Output encoding

**Attack Example**

<script>alert("hacked")</script>

The backend stores the data as input.

Protection should occur during rendering/output on the frontend.

---

## 🌍 Production CORS

**Current:**

```js
app.use(cors());
```

**Replace with:**

```js
const { CLIENT_URL } = require("./config/env");

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);
```

**Add Env Variable**

`.env` and `.env.example`

```env
CLIENT_URL=http://localhost:3000
```

**Update `config/env.js`**

```js
CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
```

---

## 🔥 Protect Auth Routes More Aggressively

Create dedicated auth limiter.

`src/middlewares/authRateLimit.middleware.js`

```js
const rateLimit = require("express-rate-limit");

const AppError = require("../utils/appError");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 5,

  standardHeaders: true,

  legacyHeaders: false,

  handler: (req, res, next) => {
    next(new AppError("Too many login attempts. Please try later.", 429));
  },
});

module.exports = authLimiter;
```

Update Auth Routes

`src/routes/auth.routes.js`

```js
const authLimiter = require("../middlewares/authRateLimit.middleware");

router.post("/login", authLimiter, validate(loginSchema), login);
```

---

## 🚀 Production Practices

**Public APIs**

`100 requests / 15 min`

**Login APIs**

`5 requests / 15 min`

**Never Trust**

- Headers
- Query Params
- Request Body
- Cookies

Rate limit violations automatically flow through AppError and the centralized logger.

---

## Security Layers

```
Helmet
↓
CORS
↓
HPP
↓
JSON Parser
↓
Rate Limit
↓
Route
↓
Validation
↓
Auth
↓
Authorization
↓
Controller
↓
Service
↓
Repository
```

---

## 🧠 My Standard Decisions

- Helmet for security headers
- Rate limiting at API layer
- Stricter auth endpoint limits
- HPP protection enabled
- Centralized AppError responses

---

## 📌 Decision Log

**Why Rate Limiting**

Protects against:

- Brute force attacks
- Abuse
- API flooding

**Why HPP**

- Prevents query parameter manipulation.

**Why XSS Awareness**

- Prevents unsafe rendering of user-generated content.
- Output encoding is the primary defense.

**Why Separate Auth Limiter**

- Login endpoints are highest-risk targets.

**Tradeoffs**

- Slight middleware overhead
- Massive security improvement

---

## ⚠️ Common Mistakes

- No rate limiting
- Open CORS in production
- Unlimited login attempts
- Trusting request payloads
- Missing security headers
- Returning sensitive errors

---

## ✅ Minimal Checklist

- [ ] express-rate-limit installed
- [ ] hpp installed
- [ ] API limiter added
- [ ] Auth limiter added
- [ ] HPP enabled
- [ ] Secure CORS configured
- [ ] Request size limits enforced
