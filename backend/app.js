const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/error");
const fileUpload = require("express-fileupload");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Route Imports
const auth = require("./routes/authRoutes");
const customer = require("./routes/customerRoutes");
const serviceRequest = require("./routes/serviceRequestRoutes");

app.use("/api/v1", auth);
app.use("/api/v1", customer);
app.use("/api/v1", serviceRequest);

// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;
