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

export type MoodLogsForGraph = {
  id: number;
  createdAt: Date;
  stressScale: number;
  anxietyScale: number;
  sadnessScale: number;
  averageScale: number;
};

export type MoodLogsAverageByMonth = {
  month: string;
  averageScore: number;
  totalLogs: number;
};
