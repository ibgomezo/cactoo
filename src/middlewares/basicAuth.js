/*
 * EXAMPLE MIDDLEWARE — Basic Auth
 *
 * Validates HTTP Basic Authorization header against a User stored in the DB.
 * Register it in config/middlewares.js to activate it.
 *
const { db } = require("#core/models");
const crypto = require("crypto");

module.exports = async function(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    res.status(401).set("WWW-Authenticate", "Basic realm=\"Restricted Area\"").send("Authorization header required.");
    return;
  }

  const credentials = Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");
  try {
    const email = credentials[0];
    const password = credentials[1];

    const user = await db.User.findOne({ where: { email } });

    const [salt, storedKeyBase64] = user.password.split(":");
    const derivedKey = crypto.scryptSync(password, salt, 128);
    const storedKey = Buffer.from(storedKeyBase64, "base64");

    if (crypto.timingSafeEqual(derivedKey, storedKey)) {
      req.user = user;
      return next();
    } else {
      res.status(401).send("Unauthorized");
      return;
    }
  } catch {
    res.status(401).send("Unauthorized");
    return;
  }
};
*/
