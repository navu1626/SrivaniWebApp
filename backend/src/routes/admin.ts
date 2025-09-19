import express from 'express';
import { adminController } from '../controllers/adminController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// GET /api/v1/admin/stats
router.get('/stats', authMiddleware, adminMiddleware, (req, res) => adminController.getStats(req, res));

export default router;
