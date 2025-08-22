import { Router } from 'express';
import { verifyToken } from '@/middleware/verify-token';
import { communityRoomPostController } from '@/controllers/controller.communityRoomPost';

const router = Router();

router.get('/:postId', verifyToken, communityRoomPostController.getPostById);
router.post('/create/:roomId', verifyToken, communityRoomPostController.create);

export default router;
