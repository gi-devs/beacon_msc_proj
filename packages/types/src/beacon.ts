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

export type BeaconRepliesDTO = {
  id: number;
  beaconId: number;
  createdAt: Date;
  replyTextKey: BeaconReplyTextKey; // matches the key of the text in the application JSON file
  replyTextId: number; // matches the id of list of texts in
};

export type BeaconRepliesDTOWithUser = BeaconRepliesDTO & {
  replierId: string;
  replierUsername: string;
};

export type BeaconNotificationDTO = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  status: BeaconNotificationStatusType;
  beacon: {
    beaconId: number;
    expiresAt: Date;
    ownerUsername: string;
    moodInfo: {
      moodFace: number;
      scales: {
        stress: number;
        anxiety: number;
        sadness: number;
      };
    };
  };
};

export type BeaconNotificationStatusType =
  | 'PENDING'
  | 'SENT'
  | 'SENT_SILENTLY'
  | 'REPLIED'
  | 'OWNER_NOTIFIED'
  | 'EXPIRED'
  | 'DECLINED'
  | 'CANCELLED';
