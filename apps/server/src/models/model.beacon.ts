import prisma, { DbClient } from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';
import { Prisma } from '@/generated/prisma';

export async function getBeaconById(id: number, tx: DbClient = prisma) {
  try {
    return await tx.beacon.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        beaconNotification: {
          select: {
            id: true,
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
    });
  } catch (error) {
    throw new CustomError('Error fetching beacon by ID', 500);
  }
}

export async function createBeacon(
  data: Prisma.BeaconCreateInput,
  tx: DbClient = prisma,
) {
  try {
    return await tx.beacon.create({
      data,
    });
  } catch (error) {
    console.log('Error creating beacon:', error);
    throw new CustomError('Error creating beacon', 500);
  }
}
