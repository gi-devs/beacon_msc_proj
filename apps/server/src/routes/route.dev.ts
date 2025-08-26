import { Router } from 'express';
import { verifyDev } from '@/middleware/dev-check';
import { devController } from '@/controllers/controller.dev';
const router = Router();

router.use(verifyDev);
router.post(
  '/manual/create-beacon-notification',
  devController.createBeaconNotification,
);
router.post('/manual/notify-beacon-owner', devController.notifyBeaconOwner);

export default router;
