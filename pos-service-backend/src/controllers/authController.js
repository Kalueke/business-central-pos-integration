const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const logger = require('../utils/logger');

class AuthController {
  /**
   * User login
   */
  async login(req, res) {
    try {
      const { username, password } = req.validatedData;

      // Find user by username
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Validate password
      const isValidPassword = await User.validatePassword(user, password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated'
        });
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate tokens
      const accessToken = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Remove password from response
      const userResponse = User.toJSON(user);

      logger.info('User logged in successfully:', {
        userId: user.id,
        username: user.username,
        role: user.role
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userResponse,
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      });
    } catch (error) {
      logger.error('Login error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        message: error.message
      });
    }
  }

  /**
   * User registration (admin only)
   */
  async register(req, res) {
    try {
      const userData = req.validatedData;

      // Check if username already exists
      const existingUsername = await User.findByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          error: 'Username already exists'
        });
      }

      // Check if email already exists
      const existingEmail = await User.findByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }

      // Create new user
      const newUser = await User.create(userData);
      const userResponse = User.toJSON(newUser);

      logger.info('User registered successfully:', {
        userId: newUser.id,
        username: newUser.username,
        role: newUser.role,
        createdBy: req.user?.id
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: userResponse
      });
    } catch (error) {
      logger.error('Registration error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: error.message
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      const userResponse = User.toJSON(req.user);

      res.status(200).json({
        success: true,
        data: userResponse
      });
    } catch (error) {
      logger.error('Get profile error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile',
        message: error.message
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const updateData = req.validatedData;
      const userId = req.user.id;

      // Check if email is being updated and if it already exists
      if (updateData.email) {
        const existingEmail = await User.findByEmail(updateData.email);
        if (existingEmail && existingEmail.id !== userId) {
          return res.status(400).json({
            success: false,
            error: 'Email already exists'
          });
        }
      }

      // Update user
      const updatedUser = await User.update(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const userResponse = User.toJSON(updatedUser);

      logger.info('Profile updated successfully:', {
        userId: updatedUser.id,
        updatedBy: req.user.id
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: userResponse
      });
    } catch (error) {
      logger.error('Update profile error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        message: error.message
      });
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.validatedData;
      const userId = req.user.id;

      // Get current user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Validate current password
      const isValidPassword = await User.validatePassword(user, currentPassword);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Update password
      const updatedUser = await User.update(userId, { password: newPassword });
      const userResponse = User.toJSON(updatedUser);

      logger.info('Password changed successfully:', {
        userId: updatedUser.id
      });

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
        data: userResponse
      });
    } catch (error) {
      logger.error('Change password error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to change password',
        message: error.message
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.validatedData;

      // Verify refresh token
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
      }

      // Get user
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
      }

      // Generate new tokens
      const newAccessToken = generateToken(user.id);
      const newRefreshToken = generateRefreshToken(user.id);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      });
    } catch (error) {
      logger.error('Refresh token error:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Refresh token expired'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to refresh token',
        message: error.message
      });
    }
  }

  /**
   * Logout
   */
  async logout(req, res) {
    try {
      // In a real application, you might want to blacklist the token
      // For now, we'll just return a success response
      
      logger.info('User logged out:', {
        userId: req.user.id,
        username: req.user.username
      });

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        message: error.message
      });
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const offset = (page - 1) * limit;

      let users = await User.getAll(parseInt(limit), offset);

      // Filter by role if provided
      if (role) {
        users = users.filter(user => user.role === role);
      }

      // Filter by search term if provided
      if (search) {
        const searchLower = search.toLowerCase();
        users = users.filter(user => 
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower)
        );
      }

      const totalUsers = await User.count();

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalUsers,
            totalPages: Math.ceil(totalUsers / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Get all users error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to get users',
        message: error.message
      });
    }
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const userResponse = User.toJSON(user);

      res.status(200).json({
        success: true,
        data: userResponse
      });
    } catch (error) {
      logger.error('Get user by ID error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to get user',
        message: error.message
      });
    }
  }

  /**
   * Update user (admin only)
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.validatedData;

      // Check if email is being updated and if it already exists
      if (updateData.email) {
        const existingEmail = await User.findByEmail(updateData.email);
        if (existingEmail && existingEmail.id !== id) {
          return res.status(400).json({
            success: false,
            error: 'Email already exists'
          });
        }
      }

      const updatedUser = await User.update(id, updateData);
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const userResponse = User.toJSON(updatedUser);

      logger.info('User updated successfully:', {
        userId: updatedUser.id,
        updatedBy: req.user.id
      });

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: userResponse
      });
    } catch (error) {
      logger.error('Update user error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to update user',
        message: error.message
      });
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete your own account'
        });
      }

      const deleted = await User.delete(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      logger.info('User deleted successfully:', {
        userId: id,
        deletedBy: req.user.id
      });

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error('Delete user error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to delete user',
        message: error.message
      });
    }
  }
}

module.exports = new AuthController(); 