const express = require("express");
const router = express.Router();

const { register } = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const { registerSchema } = require("../validators/user.validator");

router.post("/register", validate(registerSchema), register);

module.exports = router;
