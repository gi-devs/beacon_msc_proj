import prisma, { DbClient } from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';
import { normaliseDate } from '@/utils/dates';

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
