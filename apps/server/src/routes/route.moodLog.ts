import { Router } from 'express';
import { moodLogController } from '@/controllers/controller.moodLog';
import { verifyToken } from '@/middleware/verify-token';
import { journalEntryController } from '@/controllers/controller.journalEntry';

const router = Router();

router.post('/', verifyToken, moodLogController.create);
router.get('/', verifyToken, moodLogController.getManyByUserId);
router.get('/:id', verifyToken, moodLogController.getDetail);
router.get(
  '/journal-entry/:journalEntryId',
  verifyToken,
  moodLogController.getByJournalEntryId,
);

export default router;
