// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config(); // we use config() to Load .env variables from dotenv package returned by require() to the process.env

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");
const cors = require("cors");
const validationErrorHandler = require("./Middlewares/validationMiddleware");
const app = express();
app.use(cors());
// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);
// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
const authRoutes = require("./routes/auth.routes");
const recipieRoutes = require("./routes/recipie.routes");
app.use("/", indexRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", recipieRoutes);
app.use(validationErrorHandler);
// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);


module.exports = app;
