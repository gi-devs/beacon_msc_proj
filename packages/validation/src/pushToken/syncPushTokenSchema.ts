import { z } from 'zod';

export const syncPushTokenSchema = z.object({
  pushToken: z.string().min(1, { message: 'Token is required' }),
});
