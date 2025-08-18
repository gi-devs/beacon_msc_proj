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
