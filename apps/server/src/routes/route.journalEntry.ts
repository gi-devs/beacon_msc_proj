import { Router } from 'express';
import { verifyToken } from '@/middleware/verify-token';
import { journalEntryController } from '@/controllers/controller.journalEntry';

const router = Router();

router.post('/', verifyToken, journalEntryController.create);
router.get('/', verifyToken, journalEntryController.getManyByUserId);

export default router;
