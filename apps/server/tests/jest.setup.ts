import { prismaMock } from './utils/prisma-mock'; // use correct relative path

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: prismaMock,
}));

console.log('Setting up Jest with Prisma mock.');
