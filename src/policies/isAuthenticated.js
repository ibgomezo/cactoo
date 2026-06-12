module.exports = function(req, _res) {
  return req?.user?.isAuthenticated;
}