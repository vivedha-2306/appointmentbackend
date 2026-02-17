// Restrict to specific roles
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// Convenience exports
const adminOnly = restrictTo('admin');
const loggedInOnly = restrictTo('user', 'admin'); // both user & admin can access

module.exports = { restrictTo, adminOnly, loggedInOnly };