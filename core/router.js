const fs = require("fs");
const path = require("path");
const express = require("express");

const router = express.Router();
const modulesDir = path.join(__dirname, "../src/modules");
const globalViewsDir = path.join(__dirname, "../views");

module.exports = function(app, logger) {
  app.set("views", [modulesDir, globalViewsDir]);

  router.get("/", function(req, res) {
    res.render("index", { title: "Cactoo" });
  });

  app.use("/", router);

  fs.readdirSync(modulesDir).forEach(module => {
    const routerPath = path.join(modulesDir, module, "router.js");
    if (fs.existsSync(routerPath)) {
      logger.info(`Loading router: /${module} from ${routerPath}`);
      app.use("/" + module, require(routerPath));
    }
  });
};