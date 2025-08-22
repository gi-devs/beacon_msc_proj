import { Router } from 'express';
import { verifyToken } from '@/middleware/verify-token';
import { beaconNotificationController } from '@/controllers/controller.beaconNotification';

const router = Router();

router.get('/', verifyToken, beaconNotificationController.getNotifications);
router.get(
  '/:id',
  verifyToken,
  beaconNotificationController.getSingleNotification,
);

export default router;
