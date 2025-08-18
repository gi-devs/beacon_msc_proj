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
};
