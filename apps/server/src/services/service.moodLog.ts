import {
  createMoodLog,
  getMoodLogById,
  getMoodLogByJournalEntryId,
  getUserMoodLogCount,
  getUserMoodLogs,
  getUserMoodLogsAverageByMonth,
  getUserMoodLogsDateFilter,
} from '@/models/model.moodLog';
import { CustomError } from '@/utils/custom-error';
import { CreateMoodLogData } from '@beacon/validation';
import {
  MoodLogDTO,
  MoodLogsAverageByMonth,
  MoodLogsForGraph,
  MoodLogWithBeaconCheck,
  PaginatedResponse,
} from '@beacon/types';
import { getDailyCheckInsByMoodLogId } from '@/models/model.dailyCheckIn';
import { addDays, addMonths, addWeeks } from 'date-fns';

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
    (scale) => Number.isInteger(scale) && scale >= 0 && scale <= 100,
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
  const dailyCheckIns = await getDailyCheckInsByMoodLogId(
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

async function fetchMoodLogDetail(
  moodLogId: number,
): Promise<MoodLogWithBeaconCheck> {
  const moodLog = await getMoodLogById(moodLogId);

  if (!moodLog) {
    throw new CustomError('Mood log not found', 404);
  }

  const dailyCheckIn = await getDailyCheckInsByMoodLogId([moodLogId]);
  const beaconBroadcasted =
    dailyCheckIn.length > 0 ? dailyCheckIn[0].broadcasted : false;

  return {
    ...moodLog,
    beaconBroadcasted,
    isDailyCheckIn: dailyCheckIn.length > 0,
  };
}

async function fetchMoodLogByJournalEntryId(
  journalEntryId: number,
): Promise<MoodLogDTO | null> {
  const moodLog = await getMoodLogByJournalEntryId(journalEntryId);

  if (!moodLog) {
    return null;
  }

  const { userId: strippedUserId, ...sanitisedMoodLog } = moodLog;
  return sanitisedMoodLog;
}

async function fetchMoodLogAverage(
  userId: string,
  months?: string,
  weeks?: string,
  days?: string,
): Promise<MoodLogsForGraph[]> {
  let startDate: Date | undefined;

  const monthsInt = months ? parseInt(months) : 0;
  const weeksInt = weeks ? parseInt(weeks) : 0;
  const daysInt = days ? parseInt(days) : 0;

  if (isNaN(monthsInt) || isNaN(weeksInt) || isNaN(daysInt)) {
    throw new CustomError(
      'Months, weeks, and days must be valid integers',
      400,
    );
  }

  if (monthsInt < 0 || weeksInt < 0 || daysInt < 0) {
    throw new CustomError(
      'Months, weeks, and days must be non-negative integers',
      400,
    );
  }

  if (months) {
    startDate = addMonths(new Date(), -months);
  } else if (weeks) {
    startDate = addWeeks(new Date(), -weeks);
  } else if (days) {
    startDate = addDays(new Date(), -days);
  }

  const moodLogs = await getUserMoodLogsDateFilter(
    userId,
    startDate || new Date(),
  );

  return moodLogs.map((log) => ({
    id: log.id,
    createdAt: log.createdAt,
    stressScale: log.stressScale,
    anxietyScale: log.anxietyScale,
    sadnessScale: log.sadnessScale,
    averageScale: Math.round(
      (log.stressScale + log.anxietyScale + log.sadnessScale) / 3,
    ),
  }));
}

async function fetchMoodLogAverageMonths(userId: string, months: string) {
  const monthsInt = parseInt(months, 10);

  if (!Number.isInteger(monthsInt) || monthsInt < 0 || isNaN(monthsInt)) {
    throw new CustomError('Months must be a positive integer', 400);
  }

  const startDate = addMonths(new Date(), -months);

  const logAggregates = await getUserMoodLogsAverageByMonth(userId, startDate);
  const res = new Map<string, MoodLogsAverageByMonth>();

  logAggregates.forEach((log) => {
    const month = log.month;
    if (res.has(month)) {
      const existingLog = res.get(month)!;
      const totalSum =
        existingLog.averageScore * existingLog.totalLogs +
        log.averageScore * log.totalLogs;

      existingLog.totalLogs += log.totalLogs;
      existingLog.averageScore = Math.round(totalSum / existingLog.totalLogs);
    } else {
      res.set(month, {
        month: log.month,
        averageScore: Math.round(log.averageScore),
        totalLogs: log.totalLogs,
      });
    }
  });

  return logAggregates;
}

export const moodLogService = {
  create,
  getMoodLogsByUserId,
  fetchMoodLogDetail,
  fetchMoodLogByJournalEntryId,
  fetchMoodLogAverage,
  fetchMoodLogAverageMonths,
};
