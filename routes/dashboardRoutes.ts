import { Router } from 'express';
import { getDashboardData, updateOdo } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protect these routes
router.get('/', authMiddleware, getDashboardData);
router.post('/odo', authMiddleware, updateOdo);

export default router;
