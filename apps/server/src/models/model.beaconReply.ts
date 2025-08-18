import prisma, { DbClient } from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';
import { Prisma } from '@/generated/prisma';

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
