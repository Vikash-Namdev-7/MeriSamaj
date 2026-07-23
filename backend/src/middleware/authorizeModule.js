/**
 * Middleware to check granular module permissions for Head and Sub-Head users
 * @param {string} permissionKey - e.g. 'canViewEvents', 'canManageLeadership', 'canViewDharmashala'
 */
const authorizeModule = (permissionKey) => {
  return (req, res, next) => {
    try {
      // 1. Master Admin has full access to everything
      if (req.user && req.user.role === 'admin') {
        return next();
      }

      // 2. Head and Sub-Head role validation
      if (req.user && (req.user.role === 'head' || req.user.role === 'sub_head')) {
        const permissions = req.user.headPermissions || {};
        
        // If permissionKey is specified, check if granted
        if (permissionKey) {
          if (permissions[permissionKey] === true) {
            return next();
          }
          return res.status(403).json({
            status: 'error',
            message: `Access denied. You do not have permission for '${permissionKey}'.`
          });
        }
        
        return next();
      }

      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Authorized head privileges required.'
      });
    } catch (error) {
      console.error('authorizeModule middleware error:', error);
      res.status(500).json({ status: 'error', message: 'Internal authorization error' });
    }
  };
};

module.exports = authorizeModule;
