const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const ROLES = require("../constants/roles");

const { getDashboard } = require("../controllers/admin.controller");

router.get("/dashboard", auth, authorize(ROLES.ADMIN), getDashboard);

module.exports = router;
