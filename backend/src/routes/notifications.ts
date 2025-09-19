import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { notificationController } from '../controllers/notificationController';

const router = express.Router();

// All routes admin-only
router.get('/competitions', authMiddleware, adminMiddleware, asyncHandler(notificationController.getPublishedCompetitions));
router.get('/recipients', authMiddleware, adminMiddleware, asyncHandler(notificationController.getRecipients));
router.post('/send', authMiddleware, adminMiddleware, asyncHandler(notificationController.send));

export default router;

