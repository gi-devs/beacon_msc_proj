import { z } from 'zod';
import { createMoodLogSchema } from '../moodLog/createMoodLoggingSchema';
import { createJournalEntrySchema } from '../journalEntry/createJournalEntrySchema';

export const createDailyLogSchema = z.object({
  moodLog: createMoodLogSchema,
  journalEntry: createJournalEntrySchema.optional().nullable(),
  shouldBroadcast: z.boolean().optional().default(false),
});

export type CreateDailyLogData = z.infer<typeof createDailyLogSchema>;
