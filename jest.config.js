module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['lib/**/*.ts', '!lib/**/*.test.ts', '!lib/**/*.spec.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}
