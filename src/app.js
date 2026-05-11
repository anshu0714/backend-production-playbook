const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");

const errorMiddleware = require("./middlewares/error.middleware");

const logger = require("./utils/logger");

const AppError = require("./utils/appError");

const app = express();

// security
app.use(helmet());

// cors
app.use(cors());

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

// routes
app.use("/api", routes);

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
