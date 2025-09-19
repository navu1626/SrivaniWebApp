"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController_1 = require("@/controllers/authController");
const errorHandler_1 = require("@/middleware/errorHandler");
const auth_1 = require("@/middleware/auth");
const router = express_1.default.Router();
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
];
const registerValidation = [
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
    (0, express_validator_1.body)('mobileNumber')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid mobile number'),
    (0, express_validator_1.body)('ageGroup')
        .isIn(['Child', 'Youth', 'Adult'])
        .withMessage('Age group must be Child, Youth, or Adult'),
    (0, express_validator_1.body)('gender')
        .optional()
        .isIn(['Male', 'Female', 'Other'])
        .withMessage('Gender must be Male, Female, or Other'),
    (0, express_validator_1.body)('preferredLanguage')
        .optional()
        .isIn(['English', 'Hindi'])
        .withMessage('Preferred language must be English or Hindi'),
];
const forgotPasswordValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
];
const resetPasswordValidation = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
];
const changePasswordValidation = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must be at least 8 characters with uppercase, lowercase, number and special character'),
];
router.post('/login', loginValidation, (0, errorHandler_1.asyncHandler)(authController_1.authController.login));
router.post('/register', registerValidation, (0, errorHandler_1.asyncHandler)(authController_1.authController.register));
router.post('/refresh', (0, errorHandler_1.asyncHandler)(authController_1.authController.refreshToken));
router.post('/logout', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(authController_1.authController.logout));
router.post('/forgot-password', forgotPasswordValidation, (0, errorHandler_1.asyncHandler)(authController_1.authController.forgotPassword));
router.post('/reset-password', resetPasswordValidation, (0, errorHandler_1.asyncHandler)(authController_1.authController.resetPassword));
router.post('/change-password', auth_1.authMiddleware, changePasswordValidation, (0, errorHandler_1.asyncHandler)(authController_1.authController.changePassword));
router.get('/verify-email/:token', (0, errorHandler_1.asyncHandler)(authController_1.authController.verifyEmail));
router.post('/resend-verification', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(authController_1.authController.resendVerification));
router.get('/me', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(authController_1.authController.getCurrentUser));
exports.default = router;
//# sourceMappingURL=auth.js.map