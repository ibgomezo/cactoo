
module.exports = {
  url: process.env.NODE_ENV === "test" ? process.env.DB_URL_TEST : process.env.DB_URL,
  dialect: "postgres",
  seederStorage: "sequelize"
}