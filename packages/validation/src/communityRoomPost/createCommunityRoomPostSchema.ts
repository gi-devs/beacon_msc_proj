import { z } from 'zod';

export const createCommunityRoomPostSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .refine((val) => val.trim().split(/\s+/).length <= 10, {
      message: 'Title must not more than 10 words',
    }),
  content: z
    .string()
    .min(1, { message: 'Content is required' })
    .max(1000, { message: 'Content must be at most 1000 characters' }),
  moodFace: z.number().min(0).max(100),
});

export type CreateCommunityRoomPostData = z.infer<
  typeof createCommunityRoomPostSchema
>;
