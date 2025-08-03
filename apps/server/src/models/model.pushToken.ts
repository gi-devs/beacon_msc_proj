import prisma, { DbClient } from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';

export async function getPushTokenByUserId(
  userId: string,
  tx: DbClient = prisma,
) {
  try {
    return await tx.pushToken.findUnique({
      where: { userId },
    });
  } catch (error) {
    throw new CustomError('Error fetching push token by user ID', 500);
  }
}

export async function createPushToken(
  userId: string,
  token: string,
  tx: DbClient = prisma,
) {
  try {
    return await tx.pushToken.create({
      data: {
        userId,
        token,
      },
    });
  } catch (error) {
    throw new CustomError('Error creating push token', 500);
  }
}

export async function updatePushToken(
  userId: string,
  token: string,
  tx: DbClient = prisma,
) {
  try {
    return await tx.pushToken.update({
      where: { userId },
      data: { token },
    });
  } catch (error) {
    throw new CustomError('Error updating push token', 500);
  }
}

export async function deleteManyPushTokenByUserId(
  userId: string,
  tx: DbClient = prisma,
) {
  try {
    return await tx.pushToken.deleteMany({
      where: { userId },
    });
  } catch (error) {
    throw new CustomError('Error deleting push token by user ID', 500);
  }
}
