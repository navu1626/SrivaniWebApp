"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const quizController_1 = require("@/controllers/quizController");
const errorHandler_1 = require("@/middleware/errorHandler");
const router = express_1.default.Router();
const startQuizValidation = [
    (0, express_validator_1.param)('competitionId')
        .isUUID()
        .withMessage('Competition ID must be a valid UUID'),
];
const submitAnswerValidation = [
    (0, express_validator_1.param)('attemptId')
        .isUUID()
        .withMessage('Attempt ID must be a valid UUID'),
    (0, express_validator_1.body)('questionId')
        .isUUID()
        .withMessage('Question ID must be a valid UUID'),
    (0, express_validator_1.body)('selectedOptionId')
        .optional()
        .isUUID()
        .withMessage('Selected option ID must be a valid UUID'),
    (0, express_validator_1.body)('descriptiveAnswer')
        .optional()
        .trim()
        .isLength({ max: 5000 })
        .withMessage('Descriptive answer must be less than 5000 characters'),
    (0, express_validator_1.body)('timeSpentSeconds')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Time spent must be a positive integer'),
    (0, express_validator_1.body)('isMarkedForReview')
        .optional()
        .isBoolean()
        .withMessage('Marked for review must be a boolean'),
];
router.get('/user/ongoing', (0, errorHandler_1.asyncHandler)(quizController_1.quizController.getOngoingForUser));
router.get('/user/completed', (0, errorHandler_1.asyncHandler)(quizController_1.quizController.getCompletedForUser));
router.get('/user/stats', (0, errorHandler_1.asyncHandler)(quizController_1.quizController.getDashboardStats));
router.post('/start/:competitionId', startQuizValidation, (0, errorHandler_1.asyncHandler)(quizController_1.quizController.startQuiz));
router.get('/attempt/:attemptId', (0, errorHandler_1.asyncHandler)(quizController_1.quizController.getAttempt));
router.get('/attempt/:attemptId/questions', (0, errorHandler_1.asyncHandler)(quizController_1.quizController.getAttemptQuestionsApi));
router.post('/attempt/:attemptId/save', (0, errorHandler_1.asyncHandler)(quizController_1.quizController.saveProgress));
router.post('/attempt/:attemptId/submit', (0, errorHandler_1.asyncHandler)(quizController_1.quizController.submitAttempt));
router.get('/attempt/:attemptId/results', (0, errorHandler_1.asyncHandler)(quizController_1.quizController.getQuizResults));
router.get('/attempts/:attemptId/result', (0, errorHandler_1.asyncHandler)(quizController_1.quizController.getAttemptResult));
router.get('/history', (0, errorHandler_1.asyncHandler)(quizController_1.quizController.getQuizHistory));
router.post('/resume/:attemptId', (0, errorHandler_1.asyncHandler)(quizController_1.quizController.resumeQuiz));
exports.default = router;
//# sourceMappingURL=quiz.js.map