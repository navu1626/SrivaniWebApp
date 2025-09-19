"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const competitionController_1 = require("../controllers/competitionController");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const createCompetitionValidation = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    (0, express_validator_1.body)('titleHi')
        .optional()
        .trim(),
    (0, express_validator_1.body)('description')
        .optional(),
    (0, express_validator_1.body)('descriptionHi')
        .optional(),
    (0, express_validator_1.body)('bannerImageUrl')
        .optional()
        .isURL()
        .withMessage('Banner image must be a valid URL'),
    (0, express_validator_1.body)('startDate')
        .isISO8601()
        .withMessage('Please provide a valid start date'),
    (0, express_validator_1.body)('endDate')
        .isISO8601()
        .withMessage('Please provide a valid end date'),
    (0, express_validator_1.body)('hasTimeLimit')
        .optional()
        .isBoolean()
        .withMessage('Has time limit must be a boolean'),
    (0, express_validator_1.body)('timeLimitMinutes')
        .custom((value, { req }) => {
        const has = req.body.hasTimeLimit === true || req.body.hasTimeLimit === 1 || req.body.hasTimeLimit === 'true';
        if (!has)
            return true;
        if (value === undefined || value === null || value === '') {
            throw new Error('Time limit must be between 1 and 1440 minutes');
        }
        const n = Number(value);
        if (!Number.isInteger(n) || n < 1 || n > 1440) {
            throw new Error('Time limit must be between 1 and 1440 minutes');
        }
        return true;
    }),
    (0, express_validator_1.body)('maxParticipants')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Max participants must be a positive integer'),
    (0, express_validator_1.body)('questionsPerPage')
        .optional()
        .isIn([1, 5, 10, 20])
        .withMessage('Questions per page must be 1, 5, 10, or 20'),
    (0, express_validator_1.body)('allowedQuestionTypes')
        .optional()
        .isString()
        .withMessage('Allowed question types must be a string'),
    (0, express_validator_1.body)('difficultyLevel')
        .optional()
        .isIn(['Easy', 'Medium', 'Hard'])
        .withMessage('Difficulty level must be Easy, Medium, or Hard'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['Draft', 'Published', 'Active', 'Completed', 'Cancelled'])
        .withMessage('Status must be Draft, Published, Active, Completed, or Cancelled'),
    (0, express_validator_1.body)('questions')
        .optional()
        .isArray()
        .withMessage('Questions must be an array'),
    (0, express_validator_1.body)('questions.*.type')
        .optional()
        .isIn(['mcq', 'descriptive'])
        .withMessage('Question type must be mcq or descriptive'),
    (0, express_validator_1.body)('questions.*.question')
        .optional()
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Question text must be between 1 and 1000 characters'),
    (0, express_validator_1.body)('questions.*.questionHi')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Hindi question text must be less than 1000 characters'),
    (0, express_validator_1.body)('questions.*.points')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Question points must be between 1 and 100'),
    (0, express_validator_1.body)('questions.*.timeLimit')
        .optional()
        .isInt({ min: 1, max: 3600 })
        .withMessage('Question time limit must be between 1 and 3600 seconds'),
    (0, express_validator_1.body)().custom((value) => {
        if (!value.title && !value.titleHi) {
            throw new Error('Either English title or Hindi title must be provided');
        }
        if (!value.description && !value.descriptionHi) {
            throw new Error('Either English description or Hindi description must be provided');
        }
        return true;
    }),
];
const updateCompetitionValidation = [
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    (0, express_validator_1.body)('titleHi')
        .optional()
        .trim(),
    (0, express_validator_1.body)('description')
        .optional(),
    (0, express_validator_1.body)('descriptionHi')
        .optional(),
    (0, express_validator_1.body)('bannerImageUrl')
        .optional()
        .isURL()
        .withMessage('Banner image must be a valid URL'),
    (0, express_validator_1.body)('startDate')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid start date'),
    (0, express_validator_1.body)('endDate')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid end date'),
    (0, express_validator_1.body)('hasTimeLimit')
        .optional()
        .isBoolean()
        .withMessage('Has time limit must be a boolean'),
    (0, express_validator_1.body)('timeLimitMinutes')
        .custom((value, { req }) => {
        const has = req.body.hasTimeLimit === true || req.body.hasTimeLimit === 1 || req.body.hasTimeLimit === 'true';
        if (!has)
            return true;
        if (value === undefined || value === null || value === '') {
            throw new Error('Time limit must be between 1 and 1440 minutes');
        }
        const n = Number(value);
        if (!Number.isInteger(n) || n < 1 || n > 1440) {
            throw new Error('Time limit must be between 1 and 1440 minutes');
        }
        return true;
    }),
    (0, express_validator_1.body)('questionsPerPage')
        .optional()
        .isIn([1, 5, 10, 20])
        .withMessage('Questions per page must be 1, 5, 10, or 20'),
    (0, express_validator_1.body)('difficultyLevel')
        .optional()
        .isIn(['Easy', 'Medium', 'Hard'])
        .withMessage('Difficulty level must be Easy, Medium, or Hard'),
    (0, express_validator_1.body)('status')
        .optional()
        .customSanitizer((value) => {
        if (typeof value === 'string') {
            const normalized = value.toLowerCase();
            switch (normalized) {
                case 'draft': return 'Draft';
                case 'published': return 'Published';
                case 'active': return 'Active';
                case 'completed': return 'Completed';
                case 'cancelled': return 'Cancelled';
                default: return value;
            }
        }
        return value;
    })
        .isIn(['Draft', 'Published', 'Active', 'Completed', 'Cancelled'])
        .withMessage('Status must be Draft, Published, Active, Completed, or Cancelled'),
];
router.get('/', (0, errorHandler_1.asyncHandler)(competitionController_1.competitionController.getAllCompetitions));
router.get('/:competitionId', (0, errorHandler_1.asyncHandler)(competitionController_1.competitionController.getCompetitionById));
router.get('/:competitionId/questions', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(competitionController_1.competitionController.getCompetitionQuestions));
router.post('/:competitionId/register', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(competitionController_1.competitionController.registerForCompetition));
router.get('/user/registered', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(competitionController_1.competitionController.getUserCompetitions));
router.post('/', auth_1.authMiddleware, auth_1.adminMiddleware, createCompetitionValidation, (0, errorHandler_1.asyncHandler)(competitionController_1.competitionController.createCompetition));
router.put('/:competitionId', auth_1.authMiddleware, auth_1.adminMiddleware, updateCompetitionValidation, (0, errorHandler_1.asyncHandler)(competitionController_1.competitionController.updateCompetition));
router.delete('/:competitionId', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(competitionController_1.competitionController.deleteCompetition));
router.patch('/:competitionId/publish', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(competitionController_1.competitionController.publishCompetition));
router.patch('/:competitionId/declare-result', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(competitionController_1.competitionController.declareResult));
router.get('/user/active', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(competitionController_1.competitionController.getActiveForUser));
router.get('/user/upcoming', auth_1.authMiddleware, (0, errorHandler_1.asyncHandler)(competitionController_1.competitionController.getUpcomingForUser));
router.post('/:competitionId/copy', auth_1.authMiddleware, auth_1.adminMiddleware, (0, errorHandler_1.asyncHandler)(competitionController_1.competitionController.copyCompetition));
exports.default = router;
//# sourceMappingURL=competitions.js.map