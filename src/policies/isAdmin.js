module.exports = function(req) {
  return req?.user?.role === "administrator";
}