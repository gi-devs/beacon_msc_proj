import prisma, { DbClient } from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';
import { Prisma } from '@/generated/prisma';
import { DataRequestOptions } from '@beacon/types';

export async function getBeaconReplyById(id: number, tx: DbClient = prisma) {
  try {
    return await tx.beaconReply.findUnique({
      where: { id },
    });
  } catch (error) {
    throw new CustomError('Error fetching beacon reply by ID', 500);
  }
}

export async function createBeaconReply(
  data: Prisma.BeaconReplyCreateInput,
  tx: DbClient = prisma,
) {
  try {
    return await tx.beaconReply.create({
      data,
    });
  } catch (error) {
    throw new CustomError('Error creating beacon reply', 500);
  }
}

export async function getBeaconRepliesByBeaconId(
  beaconId: number,
  tx: DbClient = prisma,
  options: DataRequestOptions = {
    skip: 0,
    take: 10,
    order: { createdAt: 'desc' },
  },
) {
  const { skip = 0, take = 10, order = { createdAt: 'desc' } } = options;
  try {
    return await tx.beaconReply.findMany({
      where: { beaconId },
      orderBy: { createdAt: order.createdAt },
      skip,
      take,
      include: {
        replier: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });
  } catch (error) {
    throw new CustomError('Error fetching beacon replies by beacon ID', 500);
  }
}

export async function getBeaconRepliesByBeaconIdCount(
  beaconId: number,
  tx: DbClient = prisma,
): Promise<number> {
  try {
    return await tx.beaconReply.count({
      where: { beaconId },
    });
  } catch (error) {
    throw new CustomError('Error counting beacon replies by beacon ID', 500);
  }
}
