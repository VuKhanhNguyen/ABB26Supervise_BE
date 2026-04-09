import { Router } from 'express';
import { 
  addMaintenanceRecord, 
  uploadMiddleware, 
  getMaintenanceHistory,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  getMaintenanceRecordById
} from '../controllers/maintenanceController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protect routes
router.use(authMiddleware);

router.post('/add', uploadMiddleware, addMaintenanceRecord);
router.get('/history', getMaintenanceHistory);
router.get('/:id', getMaintenanceRecordById);
router.put('/:id', uploadMiddleware, updateMaintenanceRecord);
router.delete('/:id', deleteMaintenanceRecord);

export default router;
