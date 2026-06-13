const base = {
  dialect: "postgres",
  seederStorage: "sequelize",
};

module.exports = {
  development: { ...base, url: process.env.DB_URL },
  test:        { ...base, url: process.env.DB_URL_TEST },
  production:  { ...base, url: process.env.DB_URL },
};
