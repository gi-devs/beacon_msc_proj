import { z } from 'zod';

export const journalTagsSchema = z
  .object({
    category: z.string(),
    keywords: z.array(z.string()),
  })
  .strict();

export const createJournalEntrySchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .refine((val) => val.trim().split(/\s+/).length <= 10, {
      message: 'Title must not more than 10 words',
    }),
  content: z.string().min(1, { message: 'Content is required' }),
  moodFace: z
    .int()
    .min(1, { message: 'Mood is required' })
    .max(100, { message: 'Mood cannot be more that 100' }),
  tags: z.array(journalTagsSchema),
});

export type CreateJournalEntryData = z.infer<typeof createJournalEntrySchema>;
