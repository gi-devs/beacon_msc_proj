import { getBeaconById } from '@/models/model.beacon';
import { CustomError } from '@/utils/custom-error';
import {
  getBeaconNotificationById,
  updateBeaconNotificationById,
} from '@/models/model.beaconNotification';
import {
  CreateBeaconReplyData,
  createBeaconReplySchema,
} from '@beacon/validation';
import {
  createBeaconReply,
  getBeaconRepliesByBeaconId,
  getBeaconRepliesByBeaconIdCount,
} from '@/models/model.beaconReply';
import prisma from '@/lib/prisma';
import { handleZodError } from '@/utils/handle-zod-error';
import {
  BeaconNotificationDTO,
  BeaconRepliesDTOWithUser,
  BeaconReplyTextKey,
  PaginatedResponse,
} from '@beacon/types';
import { getDailyCheckInByMoodLogId } from '@/models/model.dailyCheckIn';

async function createReplyForBeacon(
  data: CreateBeaconReplyData,
  replierId: string,
): Promise<BeaconNotificationDTO> {
  let parsedData: CreateBeaconReplyData;
  try {
    parsedData = createBeaconReplySchema.parse(data);
  } catch (e) {
    handleZodError(e);
  }

  const { beaconId, beaconNotificationId } = parsedData;

  const beacon = await getBeaconById(beaconId);
  if (!beacon) {
    throw new CustomError(`Beacon with ID ${beaconId} not found`, 404);
  }

  if (beacon.expiresAt < new Date()) {
    throw new CustomError(`Beacon with ID ${beaconId} has expired`, 410);
  }

  const beaconNotification =
    await getBeaconNotificationById(beaconNotificationId);

  if (!beaconNotification) {
    throw new CustomError(
      `Beacon notification with ID ${beaconNotificationId} not found`,
      404,
    );
  }

  if (beaconNotification.userId !== replierId) {
    throw new CustomError(
      `You do not have permission to reply to this beacon`,
      403,
    );
  }

  if (beaconNotification.beaconId !== beaconId) {
    throw new CustomError(
      `Beacon notification with ID ${beaconNotificationId} does not belong to beacon with ID ${beaconId}`,
      404,
    );
  }

  const { reply, updatedBeaconNotif } = await prisma.$transaction(
    async (tx) => {
      const reply = await createBeaconReply(
        {
          replyTextKey: data.replyTextKey,
          replyTextId: data.replyTextId,
          beacon: {
            connect: { id: beaconId },
          },
          replier: {
            connect: { id: replierId },
          },
          beaconNotification: {
            connect: { id: beaconNotificationId },
          },
        },
        tx,
      );

      await updateBeaconNotificationById(
        beaconNotificationId,
        {
          status: 'REPLIED',
        },
        tx,
      );

      const updatedBeaconNotif =
        await getBeaconNotificationById(beaconNotificationId);

      if (!updatedBeaconNotif) {
        throw new CustomError(
          'Failed to fetch updated beacon notification',
          500,
        );
      }

      return { reply, updatedBeaconNotif };
    },
  );

  if (!reply) {
    throw new CustomError('Failed to create beacon reply', 500);
  }

  const { MoodLog } = updatedBeaconNotif.beacon.dailyCheckIn;

  return {
    id: updatedBeaconNotif.id,
    createdAt: updatedBeaconNotif.createdAt,
    updatedAt: updatedBeaconNotif.updatedAt,
    status: updatedBeaconNotif.status as BeaconNotificationDTO['status'],
    beacon: {
      beaconId: updatedBeaconNotif.beacon.id,
      expiresAt: updatedBeaconNotif.beacon.expiresAt,
      ownerUsername: updatedBeaconNotif.beacon.user.username,
      moodInfo: {
        moodFace:
          (MoodLog.anxietyScale + MoodLog.stressScale + MoodLog.sadnessScale) /
          3,
        scales: {
          stress: MoodLog.stressScale,
          anxiety: MoodLog.anxietyScale,
          sadness: MoodLog.sadnessScale,
        },
      },
    },
  };
}

async function fetchBeaconRepliesFromMoodLogId(
  moodLogId: number,
  take: number,
  skip: number,
): Promise<PaginatedResponse<BeaconRepliesDTOWithUser>> {
  const dailyCheckIn = await getDailyCheckInByMoodLogId(moodLogId);

  if (!dailyCheckIn) {
    throw new CustomError(
      `Daily check-in with mood log ID ${moodLogId} not found`,
      404,
    );
  }

  if (!dailyCheckIn.Beacon) {
    throw new CustomError(
      `No beacon associated with daily check-in for mood log ID ${moodLogId}`,
      404,
    );
  }

  const replies = await getBeaconRepliesByBeaconId(
    dailyCheckIn.Beacon.id,
    undefined,
    {
      take,
      skip,
    },
  );

  const count = await getBeaconRepliesByBeaconIdCount(dailyCheckIn.Beacon.id);

  return {
    items: replies.map((reply) => ({
      id: reply.id,
      beaconId: reply.beaconId,
      createdAt: reply.createdAt,
      replyTextKey: reply.replyTextKey as BeaconReplyTextKey,
      replyTextId: reply.replyTextId,
      replierId: reply.replierId,
      replierUsername: reply.replier.username,
    })),
    totalCount: count,
    page: Math.floor(skip / take) + 1,
    totalPages: Math.ceil(count / take),
    hasMore: count > skip + take,
  };
}

export const beaconService = {
  createReplyForBeacon,
  fetchBeaconRepliesFromMoodLogId,
};
