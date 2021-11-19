module.exports = function (req, res, next) {
  if (!req.session.isAuthenticated === true) {
    return res.redirect("/auth/login");
  }
  next();
};
