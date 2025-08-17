import { getBeaconById } from '@/models/model.beacon';
import { CustomError } from '@/utils/custom-error';
import { getBeaconNotificationById } from '@/models/model.beaconNotification';

async function fetchBeaconDetailsForAffirmations(
  id: number,
  beaconNotifId: number,
): Promise<BeaconReplyDetailsDTO> {
  const beacon = await getBeaconById(id);

  if (!beacon) {
    throw new CustomError(`Beacon with ID ${id} not found`, 404);
  }

  const beaconNotif = await getBeaconNotificationById(beaconNotifId);

  if (!beaconNotif) {
    throw new CustomError(
      `Beacon notification with ID ${beaconNotifId} not found`,
      404,
    );
  }

  const {
    dailyCheckIn,
    user: beaconOwner,
    beaconNotification: beaconNotifs,
  } = beacon;

  if (!dailyCheckIn) {
    throw new CustomError(
      `No daily check-in found for beacon with ID ${id}`,
      404,
    );
  }

  if (!beaconOwner) {
    throw new CustomError(`Beacon owner not found for beacon ID ${id}`, 404);
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

export const beaconService = {
  fetchBeaconDetailsForAffirmations,
};
