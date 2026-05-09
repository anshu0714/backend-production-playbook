const express = require("express");
const router = express.Router();

const userRoutes = require("./user.routes");
const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");

router.get("/", (req, res) => {
  res.json({ message: "API running" });
});

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
