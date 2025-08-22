import prisma, { DbClient } from '@/lib/prisma';
import { DataRequestOptions } from '@beacon/types';
import { Prisma } from '@/generated/prisma';

export async function getCommunityRoomPostsByRoomId(
  roomId: string,
  tx: DbClient = prisma,
  options: DataRequestOptions = {},
) {
  const { skip = 0, take = 10, order = { createdAt: 'desc' } } = options;
  try {
    return await tx.communityRoomPost.findMany({
      where: {
        roomId: roomId,
      },
      orderBy: { createdAt: order.createdAt },
      skip,
      take,
      include: {
        postUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  } catch (error) {
    throw new Error('Error fetching community room posts');
  }
}

export async function getCommunityRoomPostByRoomIdCount(
  roomId: string,
  tx: DbClient = prisma,
) {
  try {
    return await tx.communityRoomPost.count({
      where: {
        roomId: roomId,
      },
    });
  } catch (error) {
    throw new Error('Error fetching community room post by ID');
  }
}

export async function getCommunityPostById(
  postId: number,
  tx: DbClient = prisma,
) {
  try {
    return await tx.communityRoomPost.findUnique({
      where: {
        id: postId,
      },
      include: {
        postUser: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  } catch (error) {
    throw new Error('Error fetching community post by ID');
  }
}

export async function createCommunityRoomPost(
  data: Prisma.CommunityRoomPostCreateInput,
  tx: DbClient = prisma,
) {
  try {
    return await tx.communityRoomPost.create({
      data,
    });
  } catch (error) {
    throw new Error('Error creating community room post');
  }
}
