import { Router } from 'express';
import { moodLogController } from '@/controllers/controller.moodLog';
import { verifyToken } from '@/middleware/verify-token';

const router = Router();

router.post('/', verifyToken, moodLogController.create);
router.get('/', verifyToken, moodLogController.getManyByUserId);
router.get('/:id', verifyToken, moodLogController.getDetail);

export default router;
