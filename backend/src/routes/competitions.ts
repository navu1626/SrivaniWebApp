import express from 'express';
import { body } from 'express-validator';
import { competitionController } from '@/controllers/competitionController';
import { asyncHandler } from '@/middleware/errorHandler';
import { adminMiddleware, authMiddleware } from '@/middleware/auth';

const router = express.Router();

// Validation rules
const createCompetitionValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  // Relax Hindi title validation (no length enforcement)
  body('titleHi')
    .optional()
    .trim(),
  // Relax description validation (no length enforcement)
  body('description')
    .optional(),
  // Relax Hindi description validation
  body('descriptionHi')
    .optional(),
  body('bannerImageUrl')
    .optional()
    .isURL()
    .withMessage('Banner image must be a valid URL'),
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  body('hasTimeLimit')
    .optional()
    .isBoolean()
    .withMessage('Has time limit must be a boolean'),
  body('timeLimitMinutes')
    .custom((value, { req }) => {
      const has = req.body.hasTimeLimit === true || req.body.hasTimeLimit === 1 || req.body.hasTimeLimit === 'true';
      if (!has) return true; // ignore when time limit disabled
      if (value === undefined || value === null || value === '') {
        throw new Error('Time limit must be between 1 and 1440 minutes');
      }
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1 || n > 1440) {
        throw new Error('Time limit must be between 1 and 1440 minutes');
      }
      return true;
    }),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be a positive integer'),
  body('questionsPerPage')
    .optional()
    .isIn([1, 5, 10, 20])
    .withMessage('Questions per page must be 1, 5, 10, or 20'),
  body('allowedQuestionTypes')
    .optional()
    .isString()
    .withMessage('Allowed question types must be a string'),
  body('difficultyLevel')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty level must be Easy, Medium, or Hard'),
  body('status')
    .optional()
    .isIn(['Draft', 'Published', 'Active', 'Completed', 'Cancelled'])
    .withMessage('Status must be Draft, Published, Active, Completed, or Cancelled'),
  body('questions')
    .optional()
    .isArray()
    .withMessage('Questions must be an array'),
  body('questions.*.type')
    .optional()
    .isIn(['mcq', 'descriptive'])
    .withMessage('Question type must be mcq or descriptive'),
  body('questions.*.question')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Question text must be between 1 and 1000 characters'),
  body('questions.*.questionHi')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Hindi question text must be less than 1000 characters'),
  body('questions.*.points')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Question points must be between 1 and 100'),
  body('questions.*.timeLimit')
    .optional()
    .isInt({ min: 1, max: 3600 })
    .withMessage('Question time limit must be between 1 and 3600 seconds'),
  // Custom validation to ensure at least one language is provided
  body().custom((value) => {
    if (!value.title && !value.titleHi) {
      throw new Error('Either English title or Hindi title must be provided');
    }
    if (!value.description && !value.descriptionHi) {
      throw new Error('Either English description or Hindi description must be provided');
    }
    return true;
  }),
];

// Update validation - more lenient for partial updates
const updateCompetitionValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  // Relax Hindi title validation
  body('titleHi')
    .optional()
    .trim(),
  // Relax description validation
  body('description')
    .optional(),
  // Relax Hindi description validation
  body('descriptionHi')
    .optional(),
  body('bannerImageUrl')
    .optional()
    .isURL()
    .withMessage('Banner image must be a valid URL'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  body('hasTimeLimit')
    .optional()
    .isBoolean()
    .withMessage('Has time limit must be a boolean'),
  body('timeLimitMinutes')
    .custom((value, { req }) => {
      const has = req.body.hasTimeLimit === true || req.body.hasTimeLimit === 1 || req.body.hasTimeLimit === 'true';
      if (!has) return true; // ignore when time limit disabled
      if (value === undefined || value === null || value === '') {
        throw new Error('Time limit must be between 1 and 1440 minutes');
      }
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1 || n > 1440) {
        throw new Error('Time limit must be between 1 and 1440 minutes');
      }
      return true;
    }),
  body('questionsPerPage')
    .optional()
    .isIn([1, 5, 10, 20])
    .withMessage('Questions per page must be 1, 5, 10, or 20'),
  body('difficultyLevel')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty level must be Easy, Medium, or Hard'),
  body('status')
    .optional()
    .customSanitizer((value) => {
      // Normalize status to proper case
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

// Routes

// Get all competitions (public)
router.get('/', asyncHandler(competitionController.getAllCompetitions));

// Get competition by ID (public)
router.get('/:competitionId', asyncHandler(competitionController.getCompetitionById));

// Get competition questions (admin only)
router.get('/:competitionId/questions', authMiddleware, adminMiddleware, asyncHandler(competitionController.getCompetitionQuestions));

// Register for competition
router.post('/:competitionId/register', authMiddleware, asyncHandler(competitionController.registerForCompetition));

// Get user's registered competitions
router.get('/user/registered', authMiddleware, asyncHandler(competitionController.getUserCompetitions));

// Admin routes
router.post('/', authMiddleware, adminMiddleware, createCompetitionValidation, asyncHandler(competitionController.createCompetition));
router.put('/:competitionId', authMiddleware, adminMiddleware, updateCompetitionValidation, asyncHandler(competitionController.updateCompetition));
router.delete('/:competitionId', authMiddleware, adminMiddleware, asyncHandler(competitionController.deleteCompetition));
router.patch('/:competitionId/publish', authMiddleware, adminMiddleware, asyncHandler(competitionController.publishCompetition));
router.patch('/:competitionId/declare-result', authMiddleware, adminMiddleware, asyncHandler(competitionController.declareResult));

// User specific lists
router.get('/user/active', authMiddleware, asyncHandler(competitionController.getActiveForUser));
router.get('/user/upcoming', authMiddleware, asyncHandler(competitionController.getUpcomingForUser));

// Copy competition (admin only)
router.post('/:competitionId/copy', authMiddleware, adminMiddleware, asyncHandler(competitionController.copyCompetition));


export default router;
