import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import prisma from '../src/lib/prisma';
import { PrismaClient } from '../src/generated/prisma';

jest.mock('../src/lib/prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
