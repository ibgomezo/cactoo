const env = process.env.NODE_ENV || "sandbox";

const configs = {
  sandbox: {
    origin: ["http://synchro.coopgeneos.com","https://synchro.coopgeneos.com", "http://localhost:4000"],
    credentials: true,
    optionsSuccessStatus: 200,
    enabled: true
  },
  production: {
    origin: ["http://myweb.com"],
    credentials: true,
    optionsSuccessStatus: 200,
    enabled: true
  }
};

module.exports = configs[env];