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
