import prisma, { DbClient } from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';
import { DataRequestOptions } from '@beacon/types';

export async function getCommunityRoomBy(id: string, tx: DbClient = prisma) {
  try {
    return await tx.communityRoom.findUnique({
      where: { id },
    });
  } catch (error) {
    throw new CustomError('Error fetching beacon reply by ID', 500);
  }
}

export async function getCommunityRoomsByUserId(
  userId: string,
  tx: DbClient = prisma,
  options: DataRequestOptions = {},
) {
  const { skip = 0, take = 10, order = { createdAt: 'desc' } } = options;
  try {
    return await tx.communityRoom.findMany({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
      },
      orderBy: { createdAt: order.createdAt },
      skip,
      take,
      include: {
        communityRoomPosts: {
          include: {
            postUser: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        members: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  } catch (error) {
    throw new CustomError('Error creating community room', 500);
  }
}

export async function getCommunityRoomByUserIdCount(
  userId: string,
): Promise<number> {
  try {
    return await prisma.communityRoom.count({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
      },
    });
  } catch (error) {
    throw new CustomError('Error counting community rooms by user ID', 500);
  }
}
