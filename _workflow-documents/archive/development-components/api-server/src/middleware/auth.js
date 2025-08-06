const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

/**
 * Middleware to authenticate JWT tokens
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token required'
        }
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token or user not found'
        }
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid token'
        }
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token expired'
        }
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication error'
      }
    });
  }
};

/**
 * Middleware to check if user has access to a specific site
 */
const checkSiteAccess = async (req, res, next) => {
  try {
    const { siteId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this site
    const { data: siteAccess, error } = await supabase
      .from('site_users')
      .select('*')
      .eq('site_id', siteId)
      .eq('user_id', userId)
      .single();

    if (error || !siteAccess) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied to this site'
        }
      });
    }

    // Add site access info to request
    req.siteAccess = siteAccess;
    next();
  } catch (error) {
    console.error('Site access check error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Site access check failed'
      }
    });
  }
};

/**
 * Middleware to verify webhook signature
 */
const verifyWebhookSignature = (req, res, next) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const payload = JSON.stringify(req.body);
    
    if (!signature) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Webhook signature required'
        }
      });
    }

    // Simple signature verification (you might want to use crypto for production)
    const expectedSignature = `sha256=${require('crypto')
      .createHmac('sha256', process.env.WEBHOOK_SECRET)
      .update(payload)
      .digest('hex')}`;

    if (signature !== expectedSignature) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid webhook signature'
        }
      });
    }

    next();
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Webhook verification failed'
      }
    });
  }
};

module.exports = {
  authenticateToken,
  checkSiteAccess,
  verifyWebhookSignature
}; 