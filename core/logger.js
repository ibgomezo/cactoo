"use strict";

// If config/logger.js exists, use it — it must export { info, debug, error, log }.
try {
  module.exports = require("../config/logger");
} catch {
  const RESET = "\x1b[0m";
  const CYAN  = "\x1b[36m";
  const GRAY  = "\x1b[90m";
  const RED   = "\x1b[31m";
  const WHITE = "\x1b[37m";

  function stamp() {
    return new Date().toISOString();
  }

  module.exports = {
    info:  (...args) => console.log( `${CYAN}[INFO]${RESET}  ${stamp()}`, ...args),
    debug: (...args) => console.debug(`${GRAY}[DEBUG]${RESET} ${stamp()}`, ...args),
    error: (...args) => console.error(`${RED}[ERROR]${RESET} ${stamp()}`, ...args),
    log:   (...args) => console.log( `${WHITE}[LOG]${RESET}   ${stamp()}`, ...args),
  };
}
