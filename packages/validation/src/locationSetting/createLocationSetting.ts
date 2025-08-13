import { z } from 'zod';

export const createLocationSettingSchema = z.object({
  geohash: z.string().optional(),
  beaconRadius: z
    .int()
    .min(150, {
      message: 'Beacon radius must be at least 150 meters (0.1 kilometers)',
    })
    .max(5000, {
      message: 'Beacon radius cannot be more than 5000 meters (5 kilometers)',
    })
    .default(500),
});

export type CreateLocationSettingData = z.infer<
  typeof createLocationSettingSchema
>;
