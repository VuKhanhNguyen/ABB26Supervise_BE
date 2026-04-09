import express from 'express';
import { getAlerts, markAsRead } from '../controllers/alertController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware for all alert routes
router.use(authMiddleware);

router.get('/', getAlerts);
router.put('/:id/read', markAsRead);

export default router;
