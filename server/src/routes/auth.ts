import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validation';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { authService } from '../services/authService';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required().min(1).max(50),
  lastName: Joi.string().required().min(1).max(50),
  phoneNumber: Joi.string().optional(),
  dateOfBirth: Joi.date().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().optional().min(1).max(50),
  lastName: Joi.string().optional().min(1).max(50),
  phoneNumber: Joi.string().optional(),
  dateOfBirth: Joi.date().optional(),
  profilePicture: Joi.string().optional()
});

// Register new user
router.post('/register', validateRequest(registerSchema), asyncHandler(async (req, res) => {
  const userData = req.body;
  
  const result = await authService.register(userData);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    user: result.user,
    token: result.token
  });
}));

// Login user
router.post('/login', validateRequest(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const result = await authService.login(email, password);
  
  res.json({
    success: true,
    message: 'Login successful',
    user: result.user,
    token: result.token
  });
}));

// Google Sign-In
router.post('/google', asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  
  if (!idToken) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Google ID token is required'
    });
  }
  
  const result = await authService.googleSignIn(idToken);
  
  res.json({
    success: true,
    message: 'Google sign-in successful',
    user: result.user,
    token: result.token,
    isNewUser: result.isNewUser
  });
}));

// Forgot password
router.post('/forgot-password', validateRequest(forgotPasswordSchema), asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  await authService.forgotPassword(email);
  
  res.json({
    success: true,
    message: 'Password reset email sent successfully'
  });
}));

// Reset password
router.post('/reset-password', validateRequest(resetPasswordSchema), asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  await authService.resetPassword(token, newPassword);
  
  res.json({
    success: true,
    message: 'Password reset successfully'
  });
}));

// Change password
router.post('/change-password', authMiddleware, validateRequest(changePasswordSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.uid;
  
  await authService.changePassword(userId, currentPassword, newPassword);
  
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// Get current user profile
router.get('/profile', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  
  const user = await authService.getUserProfile(userId);
  
  res.json({
    success: true,
    user
  });
}));

// Update user profile
router.put('/profile', authMiddleware, validateRequest(updateProfileSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  const updateData = req.body;
  
  const user = await authService.updateUserProfile(userId, updateData);
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
}));

// Delete user account
router.delete('/account', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  
  await authService.deleteAccount(userId);
  
  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
}));

// Verify email
router.post('/verify-email', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  
  await authService.sendEmailVerification(userId);
  
  res.json({
    success: true,
    message: 'Verification email sent successfully'
  });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Refresh token is required'
    });
  }
  
  const result = await authService.refreshToken(refreshToken);
  
  res.json({
    success: true,
    token: result.token,
    refreshToken: result.refreshToken
  });
}));

// Logout
router.post('/logout', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.uid;
  
  await authService.logout(userId);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

export default router;