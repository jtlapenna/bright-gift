const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access token required'
      }
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: {
          code: 'FORBIDDEN',
          message: 'Invalid or expired token'
        }
      });
    }
    req.user = user;
    next();
  });
};

/**
 * Check if user has access to Bright-Gift site
 */
const checkBrightGiftAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }

  // Check if user has access to Bright-Gift site
  if (req.user.siteId && req.user.siteId !== 'brightgift') {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied to Bright-Gift site'
      }
    });
  }

  next();
};

/**
 * Generate JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

module.exports = {
  authenticateToken,
  checkBrightGiftAccess,
  generateToken
}; 