import express from 'express';
import { submitSupport } from '../controllers/supportController';

const router = express.Router();

// POST /support
router.post('/', submitSupport);

export default router;
