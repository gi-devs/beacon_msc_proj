import { Router } from 'express';
import { moodLogController } from '@/controllers/controller.moodLog';
import { verifyToken } from '@/middleware/verify-token';

const router = Router();

router.post('/', verifyToken, moodLogController.create);
router.get('/', verifyToken, moodLogController.getManyByUserId);

// ------ Mood Log Averages ------
router.get('/average', verifyToken, moodLogController.getByMoodLogDateFilter);
router.get(
  '/average/months/:months',
  verifyToken,
  moodLogController.getByMoodLogAveragesByMonth,
);

// ------ Mood Log Details ------
router.get('/:id', verifyToken, moodLogController.getDetail);
router.get(
  '/journal-entry/:journalEntryId',
  verifyToken,
  moodLogController.getByJournalEntryId,
);

export default router;
