import { z } from 'zod';

export const createMoodLogSchema = z.object({
  stressScale: z
    .number()
    .min(0, { message: 'Stress scale must be at least 0' })
    .max(100, { message: 'Stress scale must be at most 100' }),
  anxietyScale: z
    .number()
    .min(0, { message: 'Anxiety scale must be at least 0' })
    .max(100, { message: 'Anxiety scale must be at most 100' }),
  sadnessScale: z
    .number()
    .min(0, { message: 'Sadness scale must be at least 0' })
    .max(100, { message: 'Sadness scale must be at most 100' }),
  stressNote: z.string().optional().nullable(),
  anxietyNote: z.string().optional().nullable(),
  sadnessNote: z.string().optional().nullable(),
});

export type CreateMoodLogData = z.infer<typeof createMoodLogSchema>;
