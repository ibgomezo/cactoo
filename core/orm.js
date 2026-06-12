const {Sequelize} = require("sequelize");
const config = require("../config");

const sequelize = new Sequelize(config.database.url, {
  define: {
    paranoid: true
  },
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000, // Maximum time (ms) that pool will try to get connection before throwing error
    idle: 10000, // Maximum time (ms) that a connection can be idle before being released
    evict: 1000, // Time interval (ms) to run eviction to free idle connections
  },
  dialectOptions: {
    statement_timeout: 30000, // Query timeout in milliseconds (30 seconds)
    idle_in_transaction_session_timeout: 60000, // Abort any statement that waits longer than 60s for a lock
  },
  retry: {
    max: 2, // Maximum retry attempts for queries
  }
});

module.exports = sequelize;
