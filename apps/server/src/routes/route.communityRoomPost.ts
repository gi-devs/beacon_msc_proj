import { Router } from 'express';
import { verifyToken } from '@/middleware/verify-token';
import { communityRoomPostController } from '@/controllers/controller.communityRoomPost';

const router = Router();

router.get('/:postId', verifyToken, communityRoomPostController.getPostById);

export default router;
