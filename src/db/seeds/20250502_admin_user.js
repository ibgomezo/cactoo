/*
 * EXAMPLE SEED — admin user
 *
 * Run with: npm run seeds
 * Undo with: npm run seeds:undo
 *
const crypto = require("crypto");
module.exports = {
  up: (queryInterface, Sequelize) => {
    const adminUser = {
      name: "admin",
      email: "admin@admin.com",
      password: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const salt = crypto.randomBytes(8).toString("base64");
    const derivedKey = crypto.scryptSync(adminUser.password, salt, 128);
    adminUser.password = `${salt}:${derivedKey.toString("base64")}`;
    return queryInterface.bulkInsert("users", [adminUser]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("users", null, {});
  },
};
*/
