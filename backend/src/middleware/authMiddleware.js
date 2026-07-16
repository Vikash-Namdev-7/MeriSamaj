const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT authentication middleware for route protection
const protect = async (req, res, next) => {
  let token;

  // Stateless JWT: look for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    // Keep cookie fallback for compatibility, but verify statelessly
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized, no token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Fetch user to confirm existence and account status
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists'
      });
    }

    // Verify account status
    if (user.accountStatus === 'blocked') {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been blocked. Contact Samaj Admin.'
      });
    }
    
    if (user.accountStatus === 'deleted') {
      return res.status(403).json({
        status: 'error',
        message: 'Your account has been deleted.'
      });
    }

    if (user.accountStatus === 'inactive') {
      return res.status(403).json({
        status: 'error',
        message: 'Your account is currently inactive.'
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized, token failed'
    });
  }
};

// Role authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized'
      });
    }
    
    // Define role hierarchy or equivalents for flexible checks
    const userRole = req.user.role;
    
    const hasRole = roles.some(role => {
      if (role === 'admin' && userRole === 'admin') return true;
      if (role === 'head' && ['head', 'admin'].includes(userRole)) return true;
      if (role === 'user' && ['user', 'head', 'admin'].includes(userRole)) return true;
      return role === userRole;
    });

    if (!hasRole) {
      return res.status(403).json({
        status: 'error',
        message: `User role '${userRole}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
