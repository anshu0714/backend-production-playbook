const express = require("express");
const router = express.Router();

const userRoutes = require("./user.routes");

router.get("/", (req, res) => {
  res.json({ message: "API running" });
});

router.use("/users", userRoutes);

module.exports = router;
