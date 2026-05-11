# Advanced Error Handling System

## 📁 New Structure

```bash
src/
├── utils/
│   ├── appError.js
│   └── catchAsync.js
```

---

## 🧱 Create Custom Error Class

`src/utils/appError.js`

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
```

---

## 🔁 Async Wrapper

Removes repetitive try/catch from controllers.

`src/utils/catchAsync.js`

```js
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
```

---

## 🔥 Replace Controller Try/Catch

BEFORE ❌

```js
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
```

AFTER ✅

```js
const userService = require("../services/user.service");

const catchAsync = require("../utils/catchAsync");

const register = catchAsync(async (req, res) => {
  const data = await userService.registerUser(req.body);

  res.status(201).json({
    success: true,
    data,
  });
});

module.exports = {
  register,
};
```

---

## 🧠 Replace Manual Errors

BEFORE ❌

```js
const err = new Error("Unauthorized");
err.statusCode = 401;

throw err;
```

AFTER ✅

```js
const AppError = require("../utils/appError");

throw new AppError("Unauthorized", 401);
```

---

## 🔥 Update Services

`src/services/auth.service.js`

Replace:

```js
const err = new Error("Invalid credentials");
err.statusCode = 400;

throw err;
```

With:

```js
const AppError = require("../utils/appError");

throw new AppError("Invalid credentials", 400);
```

Gradually replace all manual errors across services and middleware with AppError.

---

## 🛡️ Production Error Middleware

`src/middlewares/error.middleware.js`

```js
const logger = require("../utils/logger");
const { NODE_ENV } = require("../config/env");

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: err.stack,
  });
};

const sendProdError = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (err.statusCode >= 500) {
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

  if (NODE_ENV === "development") {
    return sendDevError(err, res);
  }

  return sendProdError(err, res);
};
```

---

## 🚀 Error Response Standard

Always return:

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## 🧠 Error Categories

| Type         | Example       | Operational? |
| ------------ | ------------- | ------------ |
| validation   | invalid email | ✅           |
| auth         | unauthorized  | ✅           |
| DB duplicate | email exists  | ✅           |
| coding bug   | undefined.foo | ❌           |

---

## 🔥 Handle Unknown Routes

**Add in `src/app.js`**

Place BELOW routes:

```js
const AppError = require("./utils/appError");
```

Place after all routes and before error middleware:

```js
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});
```

---

## 🚀 Production Practices

**Never Expose**

- stack traces
- DB internals
- system paths
- sensitive config

**Always Log**

- unknown errors
- auth failures
- DB failures
- server crashes

---

## 🧠 My Standard Decisions

- AppError for operational errors
- catchAsync for controller cleanup
- centralized error middleware
- different dev/prod responses

---

## 📌 Decision Log

**Why AppError**

- Standardized error handling
- Predictable responses

**Why catchAsync**

- Removes repetitive boilerplate
- Cleaner controllers

**Why Separate Dev/Prod Errors**

- Development: debugging focus
- Production: security focus

**Tradeoffs**

- Slight abstraction increase
- Huge maintainability gain

---

## ⚠️ Common Mistakes

- throwing raw Error everywhere
- exposing stack traces in prod
- repetitive try/catch blocks
- inconsistent error responses
- not handling unknown routes

---

## ✅ Minimal Checklist

- [ ] AppError utility created
- [ ] catchAsync utility added
- [ ] controllers cleaned
- [ ] services use AppError
- [ ] centralized error middleware updated
- [ ] dev/prod errors separated
- [ ] unknown route handling added
