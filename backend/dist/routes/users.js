"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const userController_1 = require("@/controllers/userController");
const errorHandler_1 = require("@/middleware/errorHandler");
const auth_1 = require("@/middleware/auth");
const router = express_1.default.Router();
const updateProfileValidation = [
    (0, express_validator_1.body)('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('mobileNumber')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid mobile number'),
    (0, express_validator_1.body)('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date of birth'),
    (0, express_validator_1.body)('gender')
        .optional()
        .isIn(['Male', 'Female', 'Other'])
        .withMessage('Gender must be Male, Female, or Other'),
    (0, express_validator_1.body)('preferredLanguage')
        .optional()
        .isIn(['English', 'Hindi'])
        .withMessage('Preferred language must be English or Hindi'),
    (0, express_validator_1.body)('city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City must be less than 100 characters'),
    (0, express_validator_1.body)('state')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('State must be less than 100 characters'),
];
const getUsersValidation = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('search')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search term must be between 1 and 100 characters'),
];
router.get('/profile', (0, errorHandler_1.asyncHandler)(userController_1.userController.getProfile));
router.put('/profile', updateProfileValidation, (0, errorHandler_1.asyncHandler)(userController_1.userController.updateProfile));
router.get('/statistics', (0, errorHandler_1.asyncHandler)(userController_1.userController.getStatistics));
router.get('/', auth_1.authMiddleware, auth_1.adminMiddleware, getUsersValidation, (0, errorHandler_1.asyncHandler)(userController_1.userController.getAllUsers));
router.get('/export', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(userController_1.userController.exportUsers));
router.patch('/:userId/activate', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(userController_1.userController.activateUser));
router.patch('/:userId/deactivate', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(userController_1.userController.deactivateUser));
router.patch('/:userId/change-password', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(userController_1.userController.changeUserPassword));
router.get('/:userId', (0, auth_1.ownerOrAdminMiddleware)(), (0, errorHandler_1.asyncHandler)(userController_1.userController.getUserById));
router.put('/:userId', (0, auth_1.ownerOrAdminMiddleware)(), updateProfileValidation, (0, errorHandler_1.asyncHandler)(userController_1.userController.updateUserById));
router.get('/:userId/statistics', (0, auth_1.ownerOrAdminMiddleware)(), (0, errorHandler_1.asyncHandler)(userController_1.userController.getUserStatistics));
exports.default = router;
//# sourceMappingURL=users.js.map