const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const morgan = require("morgan");
const path = require("path");

const { CLIENT_URL } = require("./config/env");

const routes = require("./routes");

const apiLimiter = require("./middlewares/rateLimit.middleware");
const errorMiddleware = require("./middlewares/error.middleware");

const logger = require("./utils/logger");

const AppError = require("./utils/appError");

const app = express();

// security
app.use(helmet());
app.use(hpp());

// cors
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

// body parser
app.use(express.json({ limit: "10kb" }));

// logging
app.use(
  morgan(":method :url :status :response-time ms - :res[content-length]", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }),
);

// API rate limiter
app.use("/api", apiLimiter);

// routes
app.use("/api", routes);

// file upload
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
  });
});

// unknown routes
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// error middleware
app.use(errorMiddleware);

module.exports = app;
