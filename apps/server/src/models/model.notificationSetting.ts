import prisma, { DbClient } from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';
import { Prisma } from '@/generated/prisma';

export async function getNotificationSettingByUserId(
  userId: string,
  tx: DbClient = prisma,
) {
  try {
    return await tx.notificationSetting.findUnique({
      where: { userId },
    });
  } catch (error) {
    throw new CustomError('Error fetching user notification by user ID', 500);
  }
}

export async function createNotificationSetting(
  data: Prisma.NotificationSettingCreateInput,
  tx: DbClient = prisma,
) {
  try {
    return await tx.notificationSetting.create({
      data,
    });
  } catch (error) {
    throw new CustomError('Error creating user notification setting', 500);
  }
}

export async function updateNotificationSettingByUserId(
  userId: string,
  data: Prisma.NotificationSettingUpdateInput,
  tx: DbClient = prisma,
) {
  try {
    return await tx.notificationSetting.update({
      where: { userId },
      data,
    });
  } catch (error) {
    throw new CustomError('Error updating user notification setting', 500);
  }
}

export async function deleteNotificationSettingByUserId(
  userId: string,
  tx: DbClient = prisma,
) {
  try {
    return await tx.notificationSetting.delete({
      where: { userId },
    });
  } catch (error) {
    throw new CustomError('Error deleting user notification setting', 500);
  }
}
