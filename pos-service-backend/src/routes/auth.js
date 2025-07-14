const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
  authenticateToken, 
  requireAdmin, 
  requireCashierOrAdmin 
} = require('../middleware/auth');
const {
  validateLogin,
  validateRegister,
  validateChangePassword,
  validateUpdateProfile,
  validateRefreshToken
} = require('../validation/authValidation');

// Public routes
router.post('/login', validateLogin, authController.login);
router.post('/register', authenticateToken, requireAdmin, validateRegister, authController.register);
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, validateUpdateProfile, authController.updateProfile);
router.put('/change-password', authenticateToken, validateChangePassword, authController.changePassword);
router.post('/logout', authenticateToken, authController.logout);

// Admin only routes
router.get('/users', authenticateToken, requireAdmin, authController.getAllUsers);
router.get('/users/:id', authenticateToken, requireAdmin, authController.getUserById);
router.put('/users/:id', authenticateToken, requireAdmin, validateUpdateProfile, authController.updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, authController.deleteUser);

module.exports = router; 