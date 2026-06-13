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

app.use((req, res) => {
  if (req.accepts("html")) return res.status(404).send("<h1>404 — Not found</h1>");
  res.status(404).json({ error: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err.message || err);
  if (req.accepts("html")) return res.status(500).send("<h1>500 — Internal server error</h1>");
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;