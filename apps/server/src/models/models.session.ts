import prisma, { DbClient } from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';

export async function getSessionByToken(token: string, tx: DbClient = prisma) {
  try {
    return await tx.session.findUnique({
      where: { token },
    });
  } catch (error) {
    throw new CustomError('Error fetching session by token', 500);
  }
}

export async function getSessionByUserId(
  userId: string,
  tx: DbClient = prisma,
) {
  try {
    return await tx.session.findFirst({
      where: { userId },
    });
  } catch (error) {
    throw new CustomError('Error fetching session by user ID', 500);
  }
}

export async function createSession(
  data: {
    userId: string;
    expiresAt: Date;
  },
  tx: DbClient = prisma,
) {
  const { userId, expiresAt } = data;

  try {
    return await tx.session.create({
      data: {
        userId,
        expiresAt,
      },
    });
  } catch (error) {
    throw new CustomError('Error creating session', 500);
  }
}

export async function deleteSessionByToken(
  token: string,
  tx: DbClient = prisma,
) {
  try {
    return await tx.session.delete({
      where: { token },
    });
  } catch (error) {
    throw new CustomError('Error deleting session by token', 500);
  }
}
