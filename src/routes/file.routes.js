const express = require("express");

const router = express.Router();

const auth = require("../middlewares/auth.middleware");

const upload = require("../middlewares/upload.middleware");

const { uploadImage } = require("../controllers/file.controller");

router.post("/image", auth, upload.single("image"), uploadImage);

module.exports = router;
