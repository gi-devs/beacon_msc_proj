export enum BeaconReplyTextKey {
  Generic = 'generic',
  Anxious = 'anxious',
  Stress = 'stress',
  Sad = 'sad',
}

export type BeaconReplyDetailsDTO = {
  id: number;
  ownerUsername: string;
  beaconNotificationId: number;
  moodFace: number; // average of stress, anxiety, and sadness scales
  beaconCreatedAt: Date;
  dailyCheckInMoodScales: {
    stressScale: number;
    anxietyScale: number;
    sadnessScale: number;
  };
};
