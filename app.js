const express = require("express");
const logger = require("./core/logger");
const path = require("path");
const cookieParser = require("cookie-parser");
const loadCORS = require("./core/cors");
const policies = require("./core/policies");
const middlewares = require("./core/middlewares");
const loadRoutes = require("./core/router");

const app = express();

loadCORS(app);

if (process.env.NODE_ENV !== "test") {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
    });
    next();
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
if (!process.env.COOKIE_SECRET) {
  throw new Error("COOKIE_SECRET is not set. Copy .env-template to .env and fill in the values.");
}
app.use(require("express-session")({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, "public")));

app.use(middlewares);
app.use(policies);

app.set("view engine", "ejs");
app.use(require("express-ejs-layouts"));
app.set("layout", "layout");

loadRoutes(app, logger);

module.exports = app;