const express = require("express");
const router = express.Router();

const { login } = require("../controllers/auth.controller");
const authLimiter = require("../middlewares/authRateLimit.middleware");
const validate = require("../middlewares/validate.middleware");
const { loginSchema } = require("../validators/auth.validator");

router.post("/login", authLimiter, validate(loginSchema), login);

module.exports = router;
