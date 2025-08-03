import { Router } from 'express';
import { authController } from '@/controllers/controller.auth';
import { verifyToken } from '@/middleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.delete('/logout', verifyToken, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/profile', verifyToken, authController.profile);

export default router;
