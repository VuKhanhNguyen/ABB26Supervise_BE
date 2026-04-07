import { Router } from 'express';
import { addMaintenanceRecord, uploadMiddleware, getMaintenanceHistory } from '../controllers/maintenanceController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protect routes
router.use(authMiddleware);

router.post('/add', uploadMiddleware, addMaintenanceRecord);
router.get('/history', getMaintenanceHistory);

export default router;
