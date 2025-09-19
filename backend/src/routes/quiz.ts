import express from 'express';
import { body, param } from 'express-validator';
import { quizController } from '../controllers/quizController';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Validation rules
const startQuizValidation = [
  param('competitionId')
    .isUUID()
    .withMessage('Competition ID must be a valid UUID'),
];

const submitAnswerValidation = [
  param('attemptId')
    .isUUID()
    .withMessage('Attempt ID must be a valid UUID'),
  body('questionId')
    .isUUID()
    .withMessage('Question ID must be a valid UUID'),
  body('selectedOptionId')
    .optional()
    .isUUID()
    .withMessage('Selected option ID must be a valid UUID'),
  body('descriptiveAnswer')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Descriptive answer must be less than 5000 characters'),
  body('timeSpentSeconds')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive integer'),
  body('isMarkedForReview')
    .optional()
    .isBoolean()
    .withMessage('Marked for review must be a boolean'),
];

// Routes

// Ongoing attempts for current user
router.get('/user/ongoing', asyncHandler(quizController.getOngoingForUser));
// Completed attempts for current user
router.get('/user/completed', asyncHandler(quizController.getCompletedForUser));

// Dashboard stats for current user
router.get('/user/stats', asyncHandler(quizController.getDashboardStats));


// Start a quiz attempt
router.post('/start/:competitionId', startQuizValidation, asyncHandler(quizController.startQuiz));

// Get attempt details
router.get('/attempt/:attemptId', asyncHandler(quizController.getAttempt));

// Get questions for a quiz attempt
router.get('/attempt/:attemptId/questions', asyncHandler(quizController.getAttemptQuestionsApi));

// Save progress
router.post('/attempt/:attemptId/save', asyncHandler(quizController.saveProgress));

// Submit entire quiz
router.post('/attempt/:attemptId/submit', asyncHandler(quizController.submitAttempt));

// Get quiz results
router.get('/attempt/:attemptId/results', asyncHandler(quizController.getQuizResults));


// Get result detail for attempt
router.get('/attempts/:attemptId/result', asyncHandler(quizController.getAttemptResult));

// Get user's quiz history
router.get('/history', asyncHandler(quizController.getQuizHistory));

// Resume quiz attempt
router.post('/resume/:attemptId', asyncHandler(quizController.resumeQuiz));

export default router;
