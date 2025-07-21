module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/**/*.test.ts'],
  moduleNameMapper: {
    '^test-utils(.*)$': '<rootDir>/../../packages/test-utils$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
