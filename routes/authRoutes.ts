import { Router } from 'express';
import { register, login, getMe, updateMe, updatePushToken, forgotPassword, resetPassword } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, upload.single('avatar'), updateMe);
router.put('/push-token', authMiddleware, updatePushToken);

export default router;
