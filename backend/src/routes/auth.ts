import express from 'express';
import { body } from 'express-validator';
import { authController } from '@/controllers/authController';
import { asyncHandler } from '@/middleware/errorHandler';
import { authMiddleware } from '@/middleware/auth';

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
  body('mobileNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid mobile number'),
  body('ageGroup')
    .isIn(['Child', 'Youth', 'Adult'])
    .withMessage('Age group must be Child, Youth, or Adult'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  body('preferredLanguage')
    .optional()
    .isIn(['English', 'Hindi'])
    .withMessage('Preferred language must be English or Hindi'),
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must be at least 8 characters with uppercase, lowercase, number and special character'),
];

// Routes
router.post('/login', loginValidation, asyncHandler(authController.login));
router.post('/register', registerValidation, asyncHandler(authController.register));
router.post('/refresh', asyncHandler(authController.refreshToken));
router.post('/logout', authMiddleware, asyncHandler(authController.logout));
router.post('/forgot-password', forgotPasswordValidation, asyncHandler(authController.forgotPassword));
router.post('/reset-password', resetPasswordValidation, asyncHandler(authController.resetPassword));
router.post('/change-password', authMiddleware, changePasswordValidation, asyncHandler(authController.changePassword));
router.get('/verify-email/:token', asyncHandler(authController.verifyEmail));
router.post('/resend-verification', authMiddleware, asyncHandler(authController.resendVerification));
router.get('/me', authMiddleware, asyncHandler(authController.getCurrentUser));

export default router;
