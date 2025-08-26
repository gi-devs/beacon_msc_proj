import prisma, { DbClient } from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';
import { Prisma } from '@/generated/prisma';
import { DataRequestOptions } from '@beacon/types';

export async function getBeaconNotificationById(
  id: number,
  tx: DbClient = prisma,
) {
  try {
    return await tx.beaconNotification.findUnique({
      where: { id },
      include: {
        beacon: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
            dailyCheckIn: {
              include: {
                MoodLog: {
                  select: {
                    stressScale: true,
                    anxietyScale: true,
                    sadnessScale: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  } catch (error) {
    throw new CustomError('Error fetching beacon notification by ID', 500);
  }
}

export async function getAllBeaconNotificationsByUserId(
  userId: string,
  tx: DbClient = prisma,
  options: DataRequestOptions = {},
) {
  const { skip = 0, take = 10 } = options;

  try {
    return await tx.beaconNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        beacon: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
            dailyCheckIn: {
              include: {
                MoodLog: {
                  select: {
                    stressScale: true,
                    anxietyScale: true,
                    sadnessScale: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.log('Prisma Error: ', error);
    throw new CustomError('Error fetching beacon notifications', 500);
  }
}

export async function getAllBeaconNotificationsByUserIdCount(userId: string) {
  try {
    return await prisma.beaconNotification.count({
      where: { userId },
    });
  } catch (error) {
    throw new CustomError('Error fetching beacon notifications', 500);
  }
}

export async function updateBeaconNotificationById(
  id: number,
  data: Prisma.BeaconNotificationUpdateInput,
  tx: DbClient = prisma,
) {
  try {
    return await tx.beaconNotification.update({
      where: { id },
      data,
    });
  } catch (error) {
    throw new CustomError('Error updating beacon notification', 500);
  }
}

export async function createBeaconNotification(
  data: Prisma.BeaconNotificationCreateInput,
  tx: DbClient = prisma,
) {
  try {
    return await tx.beaconNotification.create({
      data,
    });
  } catch (error) {
    console.log('Prisma Error: ', error);
    throw new CustomError('Error creating beacon notification', 500);
  }
}
