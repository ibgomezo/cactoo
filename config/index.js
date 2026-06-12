const cors = require("./cors") || {};
const middlewares = require("./middlewares") || [];
const policies = require("./policies") || {};
const database = require("./database");
const logger = require("../core/logger");

let local = {};

try {
  if (process.env.NODE_ENV === "test") {
    logger.info("Ignoring local config on test environment");
  } else {
    local = require("./local.js")
  }
// eslint-disable-next-line no-unused-vars
} catch (error) {
  logger.info("Local config not found!")
}

module.exports = Object.assign(
  {
    cors,
    middlewares,
    policies,
    database
  },
  local
);