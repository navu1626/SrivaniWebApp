import express from 'express';
import { body, query } from 'express-validator';
import { userController } from '../controllers/userController';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware, adminMiddleware, ownerOrAdminMiddleware } from '../middleware/auth';

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  body('mobileNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid mobile number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('preferredLanguage')
    .optional()
    .isIn(['English', 'Hindi'])
    .withMessage('Preferred language must be English or Hindi'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters'),
];

const getUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];

// Routes

// Get current user profile
router.get('/profile', asyncHandler(userController.getProfile));

// Update current user profile
router.put('/profile', updateProfileValidation, asyncHandler(userController.updateProfile));

// Get user statistics
router.get('/statistics', asyncHandler(userController.getStatistics));

// Admin only routes (must come before parameterized routes)
router.get('/', authMiddleware, adminMiddleware, getUsersValidation, asyncHandler(userController.getAllUsers));
router.get('/export', authMiddleware, adminMiddleware, asyncHandler(userController.exportUsers));
router.patch('/:userId/activate', authMiddleware, adminMiddleware, asyncHandler(userController.activateUser));
router.patch('/:userId/deactivate', authMiddleware, adminMiddleware, asyncHandler(userController.deactivateUser));
router.patch('/:userId/change-password', authMiddleware, adminMiddleware, asyncHandler(userController.changeUserPassword));

// Get specific user by ID (admin or owner)
router.get('/:userId', ownerOrAdminMiddleware(), asyncHandler(userController.getUserById));

// Update specific user profile (admin or owner)
router.put('/:userId', ownerOrAdminMiddleware(), updateProfileValidation, asyncHandler(userController.updateUserById));

// Get user statistics by ID (admin or owner)
router.get('/:userId/statistics', ownerOrAdminMiddleware(), asyncHandler(userController.getUserStatistics));

export default router;
