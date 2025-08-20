import { Router } from 'express';
import { verifyToken } from '@/middleware/verify-token';
import { dailyLogController } from '@/controllers/controller.dailyCheckIn';

const router = Router();

router.post('/', verifyToken, dailyLogController.log);

export default router;
