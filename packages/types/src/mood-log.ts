export type MoodLogDTO = {
  id: number;
  stressScale: number;
  anxietyScale: number;
  sadnessScale: number;
  stressNote?: string | null;
  anxietyNote?: string | null;
  sadnessNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MoodLogWithBeaconCheck = MoodLogDTO & {
  beaconBroadcasted: boolean;
  isDailyCheckIn: boolean;
};
