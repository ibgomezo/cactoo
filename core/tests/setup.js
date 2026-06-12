const app = require("../../app.js");
const { db: models } = require("../models.js");
const logger = console;

async function clearAll() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("clearAll() can only run with NODE_ENV=test. Aborting to protect the database.");
  }
  const promises = [];
  for (let modelName in this.models) {
    if (this.models[modelName].tableName) {
      promises.push(models.sequelize.query(`DELETE FROM ${this.models[modelName].tableName}`));
    }
  }
  await Promise.all(promises);
}

logger.info("Global setup complete.");

module.exports = {
  app,
  db: {
    models,
    clearAll
  },
  logger
};
