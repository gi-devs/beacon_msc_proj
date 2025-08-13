import { z } from 'zod';

export const createNotificationSettingSchema = z.object({
  push: z.boolean(),
  maxBeaconPushes: z
    .number()
    .int()
    .min(1, { message: 'Max beacon pushes must be at least 1' })
    .max(10, { message: 'Max beacon pushes cannot be more than 10' })
    .default(3),
  beaconMinPushInterval: z
    .number()
    .int()
    .min(600, {
      message:
        'Beacon min push interval must be at least 600 seconds (10 minutes)',
    })
    .max(86400, {
      message:
        'Beacon min push interval cannot be more than 14400 seconds (4 hours)',
    })
    .default(7200), // Default to 2 hours
});

export type CreateNotificationSettingData = z.infer<
  typeof createNotificationSettingSchema
>;
