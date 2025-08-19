import prisma, { DbClient } from '@/lib/prisma';
import { MoodLog, Prisma } from '@/generated/prisma';
import { CustomError } from '@/utils/custom-error';
import { DataRequestOptions } from '@beacon/types';

export async function getUserMoodLogs(
  userId: string,
  tx: DbClient = prisma,
  options: DataRequestOptions = {},
): Promise<MoodLog[]> {
  const { skip = 0, take = 10, order = { createdAt: 'desc' } } = options;

  try {
    return tx.moodLog.findMany({
      where: {
        userId,
      },
      orderBy: { createdAt: order.createdAt },
      skip,
      take,
    });
  } catch (error) {
    console.error('Error fetching user mood logs:', error);
    throw new CustomError('Failed to fetch mood logs from database', 500);
  }
}

export async function getUserMoodLogCount(userId: string): Promise<number> {
  try {
    return prisma.moodLog.count({
      where: {
        userId,
      },
    });
  } catch (error) {
    console.error('Error counting user mood logs:', error);
    throw new CustomError('Failed to count mood logs in database', 500);
  }
}

export async function getMoodLogById(
  id: number,
  tx: DbClient = prisma,
): Promise<MoodLog | null> {
  try {
    return tx.moodLog.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Error fetching mood log by ID:', error);
    throw new CustomError('Failed to fetch mood log from database', 500);
  }
}

export async function createMoodLog(
  data: Prisma.MoodLogCreateInput,
  tx: DbClient = prisma,
): Promise<MoodLog> {
  try {
    return tx.moodLog.create({
      data,
    });
  } catch (error) {
    console.error('Error creating mood log:', error);
    throw new CustomError('Failed to create mood log in database', 500);
  }
}

export async function updateMoodLog(
  id: number,
  data: Prisma.MoodLogUpdateInput,
  tx: DbClient = prisma,
): Promise<MoodLog> {
  try {
    return tx.moodLog.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error('Error updating mood log:', error);
    throw new CustomError('Failed to update mood log in database', 500);
  }
}

export async function deleteMoodLog(
  id: number,
  tx: DbClient = prisma,
): Promise<MoodLog> {
  try {
    return tx.moodLog.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting mood log:', error);
    throw new CustomError('Failed to delete mood log from database', 500);
  }
}
