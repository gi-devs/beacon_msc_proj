import prisma, { DbClient } from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';
import { Prisma } from '@/generated/prisma';

export async function getLocationSettingByUserId(
  userId: string,
  tx: DbClient = prisma,
) {
  try {
    return await tx.locationSetting.findUnique({
      where: { userId },
    });
  } catch (error) {
    throw new CustomError('Error fetching user location by user ID', 500);
  }
}

export async function createLocationSetting(
  data: Prisma.LocationSettingCreateInput,
  tx: DbClient = prisma,
) {
  try {
    return await tx.locationSetting.create({
      data,
    });
  } catch (error) {
    throw new CustomError('Error creating user location setting', 500);
  }
}

export async function updateLocationSettingByUserId(
  userId: string,
  data: Prisma.LocationSettingUpdateInput,
  tx: DbClient = prisma,
) {
  try {
    return await tx.locationSetting.update({
      where: { userId },
      data,
    });
  } catch (error) {
    throw new CustomError('Error updating user location setting', 500);
  }
}

export async function deleteLocationSettingByUserId(
  userId: string,
  tx: DbClient = prisma,
) {
  try {
    return await tx.locationSetting.delete({
      where: { userId },
    });
  } catch (error) {
    throw new CustomError('Error deleting user location setting', 500);
  }
}
