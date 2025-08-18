import { getBeaconById, getBeaconByIdForNotify } from '@/models/model.beacon';
import { CustomError } from '@/utils/custom-error';
import {
  getBeaconNotificationById,
  updateBeaconNotificationById,
} from '@/models/model.beaconNotification';
import {
  CreateBeaconReplyData,
  createBeaconReplySchema,
} from '@beacon/validation';
import { createBeaconReply } from '@/models/model.beaconReply';
import prisma from '@/lib/prisma';
import { handleZodError } from '@/utils/handle-zod-error';
import { BeaconReplyDetailsDTO } from '@beacon/types';

async function fetchBeaconDetailsForAffirmations(
  id: number,
  beaconNotifId: number,
  receiverId: string,
): Promise<BeaconReplyDetailsDTO> {
  const beacon = await getBeaconByIdForNotify(id);

  if (!beacon) {
    throw new CustomError(`Beacon with ID ${id} not found`, 404);
  }

  const {
    dailyCheckIn, // always exists if beacon exists
    user: beaconOwner, // always exists if beacon exists
    beaconNotification: beaconNotifs,
    BeaconReplies: beaconReplies, // always exists if beacon exists
  } = beacon;

  if (!beaconNotifs.map((bn) => bn.userId).includes(receiverId)) {
    throw new CustomError(
      `You do not have permission to access this beacon`,
      403,
    );
  }

  if (beaconReplies.map((br) => br.replierId).includes(receiverId)) {
    throw new CustomError(`You have already replied to this beacon`, 403);
  }

  const beaconNotif = await getBeaconNotificationById(beaconNotifId);

  if (!beaconNotif) {
    throw new CustomError(
      `Beacon notification with ID ${beaconNotifId} not found`,
      404,
    );
  }

  // check if the beacon notification exists in the beacon's notifications
  if (!beaconNotifs.map((bn) => bn.id).includes(beaconNotif.id)) {
    throw new CustomError(
      `Beacon notification with ID ${beaconNotifId} does not belong to beacon with ID ${id}`,
      404,
    );
  }

  const moodLog = dailyCheckIn.MoodLog; // always exists if dailyCheckIn exists
  const modeFace =
    (moodLog.anxietyScale + moodLog.stressScale + moodLog.sadnessScale) / 3;

  return {
    id: beacon.id,
    ownerUsername: beaconOwner.username,
    beaconNotificationId: beaconNotif.id,
    moodFace: modeFace,
    beaconCreatedAt: beacon.createdAt,
    dailyCheckInMoodScales: {
      stressScale: moodLog.stressScale,
      anxietyScale: moodLog.anxietyScale,
      sadnessScale: moodLog.sadnessScale,
    },
  };
}

async function createReplyForBeacon(
  data: CreateBeaconReplyData,
  replierId: string,
) {
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

  const { reply } = await prisma.$transaction(async (tx) => {
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

    return { reply };
  });

  if (!reply) {
    throw new CustomError('Failed to create beacon reply', 500);
  }

  return reply;
}

export const beaconService = {
  fetchBeaconDetailsForAffirmations,
  createReplyForBeacon,
};
