const env = process.env.NODE_ENV || "development";

const configs = {
  development: {
    origin: ["http://localhost:4000"],
    credentials: true,
    optionsSuccessStatus: 200,
    enabled: true
  },
  production: {
    origin: (process.env.CORS_ORIGINS || "").split(",").filter(Boolean),
    credentials: true,
    optionsSuccessStatus: 200,
    enabled: true
  }
};

module.exports = configs[env] || configs.development;