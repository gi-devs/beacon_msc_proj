import { Router } from 'express';
import { verifyToken } from '@/middleware/verify-token';
import { notificationSettingController } from '@/controllers/controller.notificationSetting';

const router = Router();

router.use(verifyToken);

router.get('/', notificationSettingController.getByUserId);
router.post('/', notificationSettingController.create);
router.patch('/', notificationSettingController.update);

export default router;
