import { Router } from 'express';
import { verifyToken } from '@/middleware/verify-token';
import { journalEntryController } from '@/controllers/controller.journalEntry';

const router = Router();

router.post('/', verifyToken, journalEntryController.create);

export default router;
