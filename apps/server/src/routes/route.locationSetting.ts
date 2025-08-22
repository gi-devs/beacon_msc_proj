import { Router } from 'express';
import { verifyToken } from '@/middleware/verify-token';
import { locationSettingController } from '@/controllers/controller.locationSetting';

const router = Router();

router.get('/', verifyToken, locationSettingController.getByUserId);
router.post('/', verifyToken, locationSettingController.create);
router.patch('/', verifyToken, locationSettingController.update);
router.delete('/', verifyToken, locationSettingController.deleteLocation);

// ! ---------------
// ! For Testing
// ! ---------------
router.get(
  '/users',
  verifyToken,
  locationSettingController.getIntersectingUsers,
);

export default router;
