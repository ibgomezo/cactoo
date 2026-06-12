const cors = require("cors");
const corsConfig = require("../config").cors;

module.exports = function(app) {
  if (corsConfig.enabled) {
    app.use(cors({
      origin: function(origin, callback) {
        // allow requests with no origin (server to server)
        if (!origin) {
          return callback(null, true);
        }
        if (corsConfig && corsConfig.origin && !corsConfig.origin.includes(origin)) {
          return callback("The CORS policy for this site does not allow access from the specified Origin.", false);
        }   
        return callback(null, true);
      },
      credentials: corsConfig.credentials || false,
    }));
  }
};