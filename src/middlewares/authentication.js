/*
 * EXAMPLE MIDDLEWARE — Session/Basic authentication
 *
 * Populates req.user from either a Bearer session token or HTTP Basic credentials.
 * If no valid credentials are found, req.user.isAuthenticated is false and the
 * request continues — access control is enforced by policies, not here.
 *
 * Register it in config/middlewares.js to activate it.
 *
const { db } = require("#core/models");
const crypto = require("crypto");

function userRequestObject(user, isAuthenticated = false) {
  if (user) {
    return { id: user.id, email: user.email, role: user.role, isAuthenticated: Boolean(isAuthenticated) };
  }
  return { isAuthenticated: Boolean(isAuthenticated) };
}

module.exports = async (req, res, next) => {
  try {
    req.user = userRequestObject(null, false);
    const authorization = req.headers?.authorization;
    if (!authorization) return next();

    const [type, token] = authorization.split(" ");
    const decodedData = Buffer.from(token, "base64").toString("utf8");
    const [email, password] = decodedData.split(":");
    const user = await db.User.findOne({ where: { email } });
    if (!user) return next();

    if (type === "Bearer") {
      const now = new Date();
      // Use parameterized queries to avoid SQL injection
      const session = await db.sequelize.query(
        "SELECT * FROM session WHERE sid = ? AND expire > ?",
        { replacements: [password, now.toISOString()], type: db.sequelize.QueryTypes.SELECT }
      );
      if (session && session.length) req.user = userRequestObject(user, true);
    }

    if (type === "Basic") {
      const salt = user.password.split(":")[0];
      const derivedKey = crypto.scryptSync(password, salt, 128);
      const encryptedPassword = `${salt}:${derivedKey.toString("base64")}`;
      if (user.password === encryptedPassword) req.user = userRequestObject(user, true);
    }

    return next();
  } catch {
    req.user = userRequestObject(null, false);
    return next();
  }
};
*/
