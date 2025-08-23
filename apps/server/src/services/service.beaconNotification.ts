import {
  getAllBeaconNotificationsByUserId,
  getAllBeaconNotificationsByUserIdCount,
  getBeaconNotificationById,
} from '@/models/model.beaconNotification';
import { getUserById } from '@/models/model.user';
import {
  BeaconNotificationDTO,
  BeaconNotificationStatusType,
  PaginatedResponse,
} from '@beacon/types';
import { CustomError } from '@/utils/custom-error';

async function fetchUserBeaconNotifications(
  userId: string,
  take: string,
  skip: string,
): Promise<PaginatedResponse<BeaconNotificationDTO>> {
  const takeNum = parseInt(take, 10);
  const skipNum = parseInt(skip, 10);

  if (isNaN(takeNum) || isNaN(skipNum) || takeNum < 1 || skipNum < 0) {
    throw new CustomError('Invalid pagination parameters', 400);
  }

  const user = await getUserById(userId);

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  const beaconNotifications = await getAllBeaconNotificationsByUserId(
    userId,
    undefined,
    { take: takeNum, skip: skipNum },
  );

  const notificationCount =
    await getAllBeaconNotificationsByUserIdCount(userId);

  return {
    items: beaconNotifications.map((n) => {
      const moodLog = n.beacon.dailyCheckIn.MoodLog;

      if (!moodLog) {
        throw new CustomError('Associated MoodLog not found', 500);
      }

      return {
        id: n.id,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
        status: n.status as BeaconNotificationStatusType,
        beacon: {
          beaconId: n.beacon.id,
          expiresAt: n.beacon.expiresAt,
          ownerUsername: n.beacon.user.username,
          moodInfo: {
            moodFace:
              (moodLog.sadnessScale +
                moodLog.anxietyScale +
                moodLog.stressScale) /
              3,
            scales: {
              stress: moodLog.stressScale,
              anxiety: moodLog.anxietyScale,
              sadness: moodLog.sadnessScale,
            },
          },
        },
      };
    }),
    totalCount: notificationCount,
    page: Math.floor(skipNum / takeNum) + 1,
    totalPages: Math.ceil(notificationCount / takeNum),
    hasMore: takeNum + takeNum < notificationCount,
  };
}

async function fetchBeaconNotification(
  id: string,
  userId: string,
): Promise<BeaconNotificationDTO> {
  const idNum = parseInt(id, 10);

  if (isNaN(idNum) || idNum < 1) {
    throw new CustomError('Invalid beacon notification ID', 400);
  }

  const beaconNotification = await getBeaconNotificationById(idNum);

  if (!beaconNotification) {
    throw new CustomError('Beacon notification not found', 404);
  }

  if (beaconNotification.userId !== userId) {
    throw new CustomError(
      'Unauthorized access to this beacon notification',
      403,
    );
  }

  const moodLog = beaconNotification.beacon.dailyCheckIn.MoodLog;
  if (!moodLog) {
    throw new CustomError('Associated MoodLog not found', 500);
  }

  return {
    id: beaconNotification.id,
    createdAt: beaconNotification.createdAt,
    updatedAt: beaconNotification.updatedAt,
    status: beaconNotification.status as BeaconNotificationStatusType,
    beacon: {
      beaconId: beaconNotification.beacon.id,
      expiresAt: beaconNotification.beacon.expiresAt,
      ownerUsername: beaconNotification.beacon.user.username,
      moodInfo: {
        moodFace:
          (moodLog.sadnessScale + moodLog.anxietyScale + moodLog.stressScale) /
          3,
        scales: {
          stress: moodLog.stressScale,
          anxiety: moodLog.anxietyScale,
          sadness: moodLog.sadnessScale,
        },
      },
    },
  };
}

export const beaconNotificationService = {
  fetchUserBeaconNotifications,
  fetchBeaconNotification,
};
