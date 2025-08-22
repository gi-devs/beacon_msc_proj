import { Router } from 'express';
import { verifyToken } from '@/middleware/verify-token';
import { communityRoomController } from '@/controllers/controller.communityRoom';

const router = Router();

router.get('/', verifyToken, communityRoomController.getByUserId);

export default router;
