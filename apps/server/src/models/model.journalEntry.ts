import prisma, { DbClient } from '@/lib/prisma';
import { CustomError } from '@/utils/custom-error';
import { Prisma } from '@/generated/prisma';
import { DataRequestOptions } from '@beacon/types';

export async function getJournalEntryById(id: number, tx: DbClient = prisma) {
  try {
    return await tx.journalEntry.findUnique({
      where: { id },
    });
  } catch (error) {
    throw new CustomError('Error fetching journal entry by ID', 500);
  }
}

export async function getJournalEntriesByUserId(
  userId: string,
  tx: DbClient = prisma,
  options: DataRequestOptions = {
    skip: 0,
    take: 10,
    order: { createdAt: 'desc' },
  },
) {
  const { skip = 0, take = 10, order = { createdAt: 'desc' } } = options;
  try {
    return await tx.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: order.createdAt },
      skip,
      take,
    });
  } catch (error) {
    throw new CustomError('Error fetching journal entries by user ID', 500);
  }
}

export async function getJournalEntriesByUserIdCount(
  userId: string,
  tx: DbClient = prisma,
): Promise<number> {
  try {
    return await tx.journalEntry.count({
      where: { userId },
    });
  } catch (error) {
    throw new CustomError('Error counting journal entries by user ID', 500);
  }
}

export async function createJournalEntry(
  data: Prisma.JournalEntryCreateInput,
  tx: DbClient = prisma,
) {
  try {
    return await tx.journalEntry.create({
      data,
    });
  } catch (error) {
    throw new CustomError('Error creating journal entry', 500);
  }
}

export async function updateJournalEntry(
  id: number,
  data: Prisma.JournalEntryUpdateInput,
  tx: DbClient = prisma,
) {
  try {
    return await tx.journalEntry.update({
      where: { id },
      data,
    });
  } catch (error) {
    throw new CustomError('Error updating journal entry', 500);
  }
}

export async function deleteJournalEntry(id: number, tx: DbClient = prisma) {
  try {
    return await tx.journalEntry.delete({
      where: { id },
    });
  } catch (error) {
    throw new CustomError('Error deleting journal entry', 500);
  }
}
