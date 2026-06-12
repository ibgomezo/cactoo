"use strict";

const fs = require("fs");
const path = require("path");
const {Sequelize, DataTypes } = require("sequelize");
const sequelizeInstance = require("./orm");

function loadModels(sequelize, modelsPath, db) {
  fs
    .readdirSync(modelsPath)
    .forEach(file => {
      const model = require(path.join(modelsPath, file))(sequelize, DataTypes);
      if (db) {
        db[model.name] = model;
      }
    });
}

function loadFromDBFolder(sequelize, db) {
  const commonsModelsPath = path.join(__dirname, "../src/db/models");
  loadModels(sequelize, commonsModelsPath, db);
}

// eslint-disable-next-line no-unused-vars
function loadFromModules(db, sequelize) {
  const _modules_dir = path.join(__dirname, "../src/modules")
  fs
    .readdirSync(_modules_dir)
    .forEach(module => {
      let _path_models = path.join(_modules_dir, module, "models")
      loadModels(sequelize, _path_models, db);
    })
}

const db = {};

// loadFromModules(db, sequelize);
loadFromDBFolder(sequelizeInstance, db)

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelizeInstance;
db.Sequelize = Sequelize;

module.exports = {
  db,
  loadFromDBFolder
};