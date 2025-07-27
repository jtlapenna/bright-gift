const express = require('express');
const { authenticateToken, generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

/**
 * POST /api/v1/brightgift/auth/login
 * Login to Bright-Gift API
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Mock user authentication (replace with real implementation)
    // In a real implementation, you would check against the database
    const mockUser = {
      id: 'user-123',
      email: 'admin@brightgift.com',
      password: '$2a$10$hashedpassword', // This would be hashed in real implementation
      siteId: 'brightgift',
      role: 'admin',
      name: 'Bright-Gift Admin'
    };

    // Check if user exists and has access to Bright-Gift
    if (email !== mockUser.email || mockUser.siteId !== 'brightgift') {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials or access denied'
        }
      });
    }

    // In a real implementation, you would verify the password hash
    // const isValidPassword = await bcrypt.compare(password, mockUser.password);
    // if (!isValidPassword) {
    //   return res.status(401).json({
    //     error: {
    //       code: 'UNAUTHORIZED',
    //       message: 'Invalid credentials'
    //     }
    //   });
    // }

    // Generate JWT token
    const tokenPayload = {
      userId: mockUser.id,
      siteId: mockUser.siteId,
      role: mockUser.role,
      email: mockUser.email
    };

    const token = generateToken(tokenPayload);

    res.json({
      data: {
        token,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          siteId: mockUser.siteId,
          role: mockUser.role
        }
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to authenticate'
      }
    });
  }
});

/**
 * GET /api/v1/brightgift/auth/me
 * Get current user information
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Mock user data (replace with real implementation)
    const user = {
      id: req.user.userId,
      email: req.user.email,
      name: 'Bright-Gift Admin',
      siteId: req.user.siteId,
      role: req.user.role,
      permissions: ['read', 'write', 'publish', 'approve']
    };

    res.json({
      data: user
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user information'
      }
    });
  }
});

/**
 * POST /api/v1/brightgift/auth/logout
 * Logout from Bright-Gift API
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return a success response
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to logout'
      }
    });
  }
});

/**
 * POST /api/v1/brightgift/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Generate new token with same payload
    const tokenPayload = {
      userId: req.user.userId,
      siteId: req.user.siteId,
      role: req.user.role,
      email: req.user.email
    };

    const newToken = generateToken(tokenPayload);

    res.json({
      data: {
        token: newToken
      },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to refresh token'
      }
    });
  }
});

module.exports = router; 