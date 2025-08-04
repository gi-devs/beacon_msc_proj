import { Router } from 'express';
import { moodLogController } from '@/controllers/controller.moodLog';
import { verifyToken } from '@/middleware/verify-token';

const router = Router();

router.post('/', verifyToken, moodLogController.create);

export default router;
