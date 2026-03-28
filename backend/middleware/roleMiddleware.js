// Role-based access control (RBAC) middleware.
// Works with `protect` which attaches `req.user = { id, role }`.

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden." });
    }

    return next();
  };
};

module.exports = {
  requireRole
};

