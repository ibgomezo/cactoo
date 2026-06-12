const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const declaredMiddlewares = require("../config").middlewares;
const connect = require("connect");
const logger = require("../core/logger");

const middlewares = {};
fs
  .readdirSync(path.join(__dirname, "../src/middlewares"))
  .filter(file => {
    return (file.indexOf(".") !== 0) && (file !== basename) && (file.slice(-3) === ".js");
  })
  .forEach(file => {
    middlewares[file.slice(0, file.lastIndexOf("."))] = require(path.join(__dirname, "../src/middlewares", file));
  });

/**
 * 
 * @param {*} _arr 
 * 
 * Valida la existencia de todos los middlewares
 * Devuelve true si todos existen, de lo contrario 
 * devuelve false.
 */
function validateMiddlewares(_arr = []) {
  for (let index in _arr) {
    if (!middlewares[_arr[index]]) {
      logger.error("Middleware " + _arr[index] + " does not exists.");
      return false;
    } 
  }
  return true;
}

module.exports = (function() {
  const chain = connect();
  
  if (validateMiddlewares(declaredMiddlewares)) {
    const mdds = (declaredMiddlewares || []).map(_name => {
      return middlewares[_name]
    })
    mdds.forEach(function(_mdd) {
      chain.use(_mdd);
    });
  } 
  
  return chain;
})();