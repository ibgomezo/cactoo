const express = require("express");
const HyperDX = require("@hyperdx/node-opentelemetry");

// Configure which instrumentations to disable (defaults to common noisy ones)
const disabledInstrumentations = (process.env.HYPERDX_DISABLED_INSTRUMENTATIONS || "pg,express,http")
  .split(",")
  .reduce((acc, lib) => {
    acc[`@opentelemetry/instrumentation-${lib.trim()}`] = { enabled: false };
    return acc;
  }, {});

HyperDX.init({
  apiKey: process.env.HYPERDX_API_KEY,
  service: process.env.HYPERDX_SERVICE_NAME || "fv-synchronizer",
  instrumentations: disabledInstrumentations,
});
const logger = require("./core/logger");
const pinoHTTP = require("pino-http");
const path = require("path");
const cookieParser = require("cookie-parser");
const loadCORS = require("./core/cors");
const policies = require("./core/policies");
const middlewares = require("./core/middlewares");
const loadRoutes = require("./core/router");

const app = express();

loadCORS(app);

if (process.env.NODE_ENV !== "test") {
  app.use(pinoHTTP({
    logger,
  }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require("express-session")({ 
  secret: process.env.COOKIE_SECRET || "(Kc621MD%<A#uF%+i+0._yJS", 
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