module.exports = function(req, res) {
  return req?.user?.role === "administrator";
}