const fs = require("fs");
const path = require("path");
const basename = path.basename(__filename);
const configuredPolicies = require("../config").policies;
const logger = require("../core/logger");

/**
 * Carga de policies durante la carga del archivo
 */
let policies = {};
fs
  .readdirSync(path.join(__dirname, "../src/policies"))
  .filter(file => {
    return (file.indexOf(".") !== 0) && (file !== basename) && (file.slice(-3) === ".js");
  })
  .forEach(file => {
    policies[file.slice(0, file.lastIndexOf("."))] = require(path.join(__dirname, "../src/policies", file));
  });

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} _arr 
 * 
 * Aplica todas las policies de _arr
 * Devuelve true si pasan todas las policies
 * Devuelve false si falla alguna policie
 */
function applyPolicies(req, res, _arr = []) {
  for (let index = 0; index < _arr.length; index++) {
    if (policies[_arr[index]]) {
      if (!policies[_arr[index]](req, res)) { //Si no pasa la policie
        logger.error(`Request from ${req.ip} not pass ${_arr[index]} policy`);
        return false
      }
      continue;
    }
    throw new Error(`Policie ${_arr[index]} does not exists`);
  }
  return true;
}

function matchRoute(config, url) {
  function match(urlTemplate = "", reqUrl = "") {
    const templateSplitted = urlTemplate.split("/");
    const reqUrlSplitted = reqUrl.split("/");
    if (templateSplitted.length !== reqUrlSplitted.length) {
      return false;
    }
    for (let i=0; i<=templateSplitted.length; i++) {
      if (templateSplitted[i] === reqUrlSplitted[i]) {
        continue;
      }
      if (templateSplitted[i].startsWith(":")) {
        continue;
      }
      return false;
    }
    return true;
  }

  const urls = Object.keys(config);
  for (let i = 0; i <= urls.length; i++) {
    const urlTemplate = urls[i];
    if (match(urlTemplate, url)) {
      return urlTemplate;
    }
  }

  return null;
}

module.exports = function(req, res, next) {
  try {
    // Policie que matchea con la ruta actual
    const matchedRoute = matchRoute(configuredPolicies, req.originalUrl);

    // Policies para todas las rutas
    let ofAllRoutes = configuredPolicies["*"] ? configuredPolicies["*"] : null;

    // Policies de la ruta específica
    if (matchedRoute) {
      const ofMethod = configuredPolicies[matchedRoute][req.method.toLowerCase()] ? configuredPolicies[matchedRoute][req.method.toLowerCase()]: null;
      const ofPath = configuredPolicies[matchedRoute]["*"] ? configuredPolicies[matchedRoute]["*"] : null;

      if (ofMethod || ofPath) {
        ofAllRoutes = ofAllRoutes ? ofAllRoutes : [];
        ofAllRoutes = ofMethod ? ofAllRoutes.concat(ofMethod) : ofAllRoutes;
        ofAllRoutes = ofPath && ofAllRoutes.length == 0 ? ofAllRoutes.concat(ofPath) : ofAllRoutes;
      }
    }

    if (!ofAllRoutes) {
      return next();
    }

    // Aplicacion de policies
    if (Array.isArray(ofAllRoutes) && ofAllRoutes.length) {
      const passAllPolicies = applyPolicies(req, res, ofAllRoutes);
      if (passAllPolicies) {
        return next();
      }
      return res.sendStatus(401);
    }

    // Pasa todas las policies
    return next();
  } catch (error) {
    logger.error(error.message);
    res.sendStatus(503);
  }
};