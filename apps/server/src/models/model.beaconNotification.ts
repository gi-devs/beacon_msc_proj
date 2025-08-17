import prisma, { DbClient } from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';
import { Prisma } from '@/generated/prisma';

export async function getBeaconNotificationById(
  id: number,
  tx: DbClient = prisma,
) {
  try {
    return await tx.beaconNotification.findUnique({
      where: { id },
    });
  } catch (error) {
    throw new CustomError('Error fetching beacon notification by ID', 500);
  }
}

export async function createBeacon(
  data: Prisma.BeaconNotificationCreateInput,
  tx: DbClient = prisma,
) {
  try {
    return await tx.beaconNotification.create({
      data,
    });
  } catch (error) {
    console.log('Error creating beaconNotification:', error);
    throw new CustomError('Error creating beacon notification', 500);
  }
}
