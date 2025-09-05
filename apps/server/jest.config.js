/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@beacon/types$': '<rootDir>/../../packages/types/src',
    '^@beacon/utils$': '<rootDir>/../../packages/utils/src',
    '^@beacon/validation$': '<rootDir>/../../packages/validation/src',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.test.json' },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '<rootDir>/src/generated/prisma/',
    '<rootDir>/src/services/services.dev.ts',
    '<rootDir>/src/controllers/controller.dev.ts',
  ],
};
