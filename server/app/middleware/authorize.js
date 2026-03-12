/**
 * RBAC Authorization Middleware
 * Usage: authorize('ADMIN')  or  authorize('ADMIN', 'TUTOR')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.user_type)) {
      return res.status(403).json({ message: 'Access denied. You do not have permission for this resource.' });
    }
    next();
  };
};

module.exports = authorize;
