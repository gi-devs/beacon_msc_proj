import { Router } from 'express';
import { verifyToken } from '@/middleware/verify-token';
import { beaconController } from '@/controllers/controller.beacon';

const router = Router();

router.get(
  '/:id/notification/:beaconNotifId',
  verifyToken,
  beaconController.receive,
);

export default router;
