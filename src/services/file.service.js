const AppError = require("../utils/appError");

const uploadImage = async (file) => {
  if (!file) {
    throw new AppError("No file uploaded", 400);
  }

  return {
    filename: file.filename,
    path: file.path,
    size: file.size,
  };
};

module.exports = {
  uploadImage,
};
