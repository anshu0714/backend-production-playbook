const express = require("express");
const router = express.Router();

const { register, getProfile } = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const auth = require("../middlewares/auth.middleware");
const { registerSchema } = require("../validators/user.validator");

router.post("/register", validate(registerSchema), register);
router.get("/me", auth, getProfile);

module.exports = router;
