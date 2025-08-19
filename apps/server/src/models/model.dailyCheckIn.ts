import prisma, { DbClient } from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';
import { normaliseDate } from '@/utils/dates';
import { CreateDailyCheckInData, DataRequestOptions } from '@beacon/types';

export async function getDailyCheckInByUserIdAndDate(
  userId: string,
  date: Date,
  tx: DbClient = prisma,
) {
  try {
    return await tx.dailyCheckIn.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });
  } catch (error) {
    throw new CustomError('Error fetching daily check-in by ID', 500);
  }
}

export async function getDailyCheckInsByUserId(
  userId: string,
  tx: DbClient = prisma,
  options: DataRequestOptions = {},
) {
  const { skip = 0, take = 10, order = { createdAt: 'desc' } } = options;
  try {
    return await tx.dailyCheckIn.findMany({
      where: { userId },
      orderBy: { createdAt: order.createdAt },
      skip,
      take,
    });
  } catch (error) {
    throw new CustomError('Error fetching daily check-ins', 500);
  }
}

export async function getDailyCheckInByMoodLogId(
  moodLogIds: number[],
  tx: DbClient = prisma,
) {
  try {
    return await tx.dailyCheckIn.findMany({
      where: {
        moodLogId: {
          in: moodLogIds,
        },
      },
      select: {
        moodLogId: true,
        broadcasted: true,
      },
    });
  } catch (error) {
    throw new CustomError('Error fetching daily check-ins', 500);
  }
}

export async function createDailyCheckIn(
  data: CreateDailyCheckInData,
  tx: DbClient = prisma,
) {
  try {
    return await tx.dailyCheckIn.create({
      data: {
        ...data,
        date: normaliseDate(new Date()), // Ensure date is a Date object
      },
    });
  } catch (error) {
    throw new CustomError('Error creating daily check-in', 500);
  }
}
