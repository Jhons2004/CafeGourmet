const { isAllowed } = require('../permissions/policies');

function requirePermission(resource, action) {
  return (req, res, next) => {
    const role = req.user?.rol;
    if (!role || !isAllowed(role, resource, action)) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    return next();
  };
}

module.exports = { requirePermission };
