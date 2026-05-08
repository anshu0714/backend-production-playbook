const express = require("express");
const router = express.Router();

const { login } = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const { loginSchema } = require("../validators/auth.validator");

router.post("/login", validate(loginSchema), login);

module.exports = router;
