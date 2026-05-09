const getDashboard = (req, res) => {
  res.json({
    success: true,
    message: "Admin dashboard",
  });
};

module.exports = {
  getDashboard,
};
