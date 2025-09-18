import express from 'express';
import {
  getAllUsers,
  getUserProfile,
  updateUser,
  deleteUser,
  getUserStats
} from '../controllers/userController.js';
import { handleValidationErrors, validateObjectId, validatePagination } from '../middleware/validation.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/test
// @desc    Test users route
// @access  Public
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Users route working',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private (Admin)
router.get('/stats', authenticate, isAdmin, getUserStats);

// @route   GET /api/users
// @desc    Get all users (public profiles)
// @access  Public
router.get('/', validatePagination, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get single user profile
// @access  Public
router.get('/:id', validateObjectId(), getUserProfile);

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
// @access  Private (Admin)
router.put('/:id', authenticate, isAdmin, validateObjectId(), updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticate, isAdmin, validateObjectId(), deleteUser);

export default router;