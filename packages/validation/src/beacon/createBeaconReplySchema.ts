import { z } from 'zod';

export const createBeaconFormSchema = z.object({
  beaconId: z.number().min(1, { message: 'Beacon ID is required' }),
  beaconNotificationId: z
    .number()
    .min(1, { message: 'notification ID is required' }),
  replyTextKey: z
    .enum(['generic', 'anxious', 'stress', 'sad'], {
      message: 'Reply text key must be one of: generic, anxious, stress, sad',
    })
    .nullable(),
  replyTextId: z
    .number()
    .min(1, { message: 'Reply text ID is required' })
    .nullable(),
});

export const createBeaconReplySchema = createBeaconFormSchema.extend({
  replyTextId: z.number(), // non-null
  replyTextKey: z.enum(['generic', 'anxious', 'stress', 'sad'], {
    message: 'Reply text key must be one of: generic, anxious, stress, sad',
  }), // non-null
});

export type CreateBeaconReplyData = z.infer<typeof createBeaconReplySchema>;
export type CreateBeaconFormData = z.infer<typeof createBeaconFormSchema>;
