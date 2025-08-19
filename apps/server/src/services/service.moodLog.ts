import {
  createMoodLog,
  getUserMoodLogCount,
  getUserMoodLogs,
} from '@/models/model.moodLog';
import { CustomError } from '@/utils/custom-error';
import { CreateMoodLogData } from '@beacon/validation';
import {
  MoodLogDTO,
  MoodLogWithBeaconCheck,
  PaginatedResponse,
} from '@beacon/types';
import { getDailyCheckInByMoodLogId } from '@/models/model.dailyCheckIn';

async function create(
  data: CreateMoodLogData,
  userId: string,
): Promise<MoodLogDTO> {
  let {
    stressScale,
    anxietyScale,
    sadnessScale,
    stressNote,
    anxietyNote,
    sadnessNote,
  } = data;

  stressScale = Math.round(stressScale);
  anxietyScale = Math.round(anxietyScale);
  sadnessScale = Math.round(sadnessScale);

  const scales = [stressScale, anxietyScale, sadnessScale];
  const isValid = scales.every(
    (scale) => Number.isInteger(scale) && scale >= 1 && scale <= 100,
  );

  if (!isValid) {
    throw new CustomError(
      'Mood scale values must be integers between 1 and 100.',
      400,
    );
  }

  const createdMoodLog = await createMoodLog({
    stressScale,
    anxietyScale,
    sadnessScale,
    stressNote: stressNote || null,
    anxietyNote: anxietyNote || null,
    sadnessNote: sadnessNote || null,
    user: {
      connect: { id: userId },
    },
  });

  const { userId: strippedUserId, ...sanitisedMoodLog } = createdMoodLog;

  return sanitisedMoodLog;
}

async function getMoodLogsByUserId(
  userId: string,
  take: number,
  skip: number,
): Promise<PaginatedResponse<MoodLogWithBeaconCheck>> {
  const moodLogs = await getUserMoodLogs(userId, undefined, {
    take: take,
    skip: skip,
  });

  const totalCount = await getUserMoodLogCount(userId);
  const dailyCheckIns = await getDailyCheckInByMoodLogId(
    moodLogs.map((log) => log.id),
  );

  // for every moodLog, check if it has a daily check-in
  const moodLogsWithBeaconCheck = moodLogs.map((log) => {
    const dailyCheckIn = dailyCheckIns.find(
      (checkIn) => checkIn.moodLogId === log.id,
    );

    const beaconBroadcasted = dailyCheckIn ? dailyCheckIn.broadcasted : false;

    return {
      ...log,
      beaconBroadcasted,
      isDailyCheckIn: !!dailyCheckIn,
    };
  });

  return {
    items: moodLogsWithBeaconCheck,
    totalCount: totalCount,
    page: Math.floor(skip / take) + 1,
    totalPages: Math.ceil(totalCount / take),
    hasMore: totalCount > skip + take,
  };
}

export const moodLogService = {
  create,
  getMoodLogsByUserId,
};
