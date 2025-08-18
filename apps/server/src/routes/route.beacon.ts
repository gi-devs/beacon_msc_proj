import { Router } from 'express';
import { verifyToken } from '@/middleware/verify-token';
import { beaconController } from '@/controllers/controller.beacon';

const router = Router();

router.use(verifyToken);

router.get('/:id/notification/:beaconNotifId', beaconController.receive);

router.post('/:id/notification/:beaconNotifId', beaconController.reply);

export default router;
