# 📦 DAY 10 — File Upload + Storage (Production File Management)

## 📦 Install Dependencies

```bash
npm install multer
```

---

## 📁 Folder Structure

Add:

```bash
src/
├── middlewares/
│   └── upload.middleware.js
│
├── services/
│   └── file.service.js
│
├── controllers/
│   └── file.controller.js
│
├── routes/
│   └── file.routes.js
│
uploads/
```

---

## 🔐 Environment Variables

Add in `.env` and `.env.example`

`MAX_FILE_SIZE=5242880`

Update `config/env.js`

```js
MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE) || 5242880,
```

---

## Update `.gitignore`

Add in `.gitignore`

```bash
uploads/
```

---

## 📂 Upload Middleware

`src/middlewares/upload.middleware.js`

```js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const AppError = require("../utils/appError");
const { MAX_FILE_SIZE } = require("../config/env");

const uploadPath = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new AppError("Only image uploads are allowed", 400));
  }

  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});
```

---

## 📁 File Service

`src/services/file.service.js`

```js
const AppError = require("../utils/appError");

const uploadImage = async (file) => {
  if (!file) {
    throw new AppError("No file uploaded", 400);
  }

  return {
    filename: file.filename,
    path: file.path,
    size: file.size,
  };
};

module.exports = {
  uploadImage,
};
```

---

## 🎯 File Controller

`src/controllers/file.controller.js`

```js
const catchAsync = require("../utils/catchAsync");

const fileService = require("../services/file.service");

const uploadImage = catchAsync(async (req, res) => {
  const file = await fileService.uploadImage(req.file);

  res.status(201).json({
    success: true,
    data: file,
  });
});

module.exports = {
  uploadImage,
};
```

---

## 🔗 File Routes

`src/routes/file.routes.js`

```js
const express = require("express");

const router = express.Router();

const auth = require("../middlewares/auth.middleware");

const upload = require("../middlewares/upload.middleware");

const { uploadImage } = require("../controllers/file.controller");

router.post("/image", auth, upload.single("image"), uploadImage);

module.exports = router;
```

---

## 🔗 Register Routes

Update `routes/index.js`

```js
const fileRoutes = require("./file.routes");

router.use("/files", fileRoutes);
```

---

## 📂 Serve Uploaded Files

Update `app.js`

```js
const path = require("path");
```

```js
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
```

---

## 🛡️ Multer Error Handling

Update Error Middleware

```js
const multer = require("multer");
const AppError = require("../utils/appError");

if (err instanceof multer.MulterError) {
  err = new AppError(err.message, 400);
}
```

Place before normal error handling.

---

## ☁️ Production Storage Strategy

**Development**

```bash
Server
 ↓
uploads/
```

**Production**

```bash
Server
 ↓
S3 / Cloudinary
 ↓
Store URL in DB
```

**Never Do**
Store large files on application server

---

## 🚀 Production Practices

**Validate**

- MIME type
- Size
- File presence

**Restrict**

- Maximum file size
- Allowed formats

**Store**

- Metadata in DB
- Actual file in storage service

**Naming**

- Generate unique filenames.
- Never trust:

  ```bash
  file.originalname
  ```

---

## 🧠 My Standard Decisions

- Multer for uploads
- Middleware-based file handling
- Storage abstraction through service layer
- Cloud-ready design

---

## 📌 Decision Log

**Why Multer**

- Industry standard
- Stable ecosystem
- Easy integration

**Why Service Layer**

- Keeps storage logic outside controllers.

**Why Cloud Storage Later**

- Application servers should remain stateless.

**Tradeoffs**

- Local storage simple
- Cloud storage required for scale

---

## ⚠️ Common Mistakes

- Accepting all file types
- No file size limit
- Storing files in database
- Trusting original filenames
- Upload logic inside controller

---

## ✅ Minimal Checklist

- [ ] multer installed
- [ ] upload middleware created
- [ ] image validation added
- [ ] upload service created
- [ ] upload controller added
- [ ] upload route added
- [ ] static file serving configured
- [ ] multer errors handled
