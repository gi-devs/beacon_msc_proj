module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  moduleNameMapper: {
    '^test-utils(.*)$': '<rootDir>/../../packages/test-utils$1',
    '^@/(.*)$': '<rootDir>/src/$1', // ✅ maps @/ to src/
  },
  setupFiles: ['<rootDir>/tests/jest.setup.ts'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/src/generate/',
  ],
};
