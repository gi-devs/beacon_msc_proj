import { Router } from 'express';
import { pushTokenController } from '@/controllers/controller.pushToken';
import { verifyToken } from '@/middleware/verify-token';

const router = Router();

router.post('/sync', verifyToken, pushTokenController.sync);

export default router;
