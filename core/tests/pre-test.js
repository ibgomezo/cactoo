#!/usr/bin/env node

if (process.env.NODE_ENV !== "test") {
  console.error("pre-test.js can only run with NODE_ENV=test.");
  console.error("Aborting to protect the production database.");
  process.exit(1);
}

const {Sequelize} = require("sequelize")
const {Umzug, SequelizeStorage} = require("umzug");
const {loadFromDBFolder} = require("../models");

const sequelize = new Sequelize(process.env.DB_URL_TEST);

const umzug = new Umzug({
  migrations: {
    glob: "src/db/migrations/*.js",
    resolve: ({name, path, context}) => {
      const migration = require(path)
      return {
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize),
      }
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({sequelize}),
  logger: console,
});

loadFromDBFolder(sequelize)

sequelize.drop({cascade: true}) 
  .then(() => {
    return umzug.up();
  })
  .then(() => {
    console.log("Database reset and migrations applied successfully.");
    sequelize.close();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });