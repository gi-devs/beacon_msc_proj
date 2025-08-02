import { Prisma, PrismaClient } from '@/generated/prisma';

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export type DbClient = PrismaClient | Prisma.TransactionClient;

export default prisma;
