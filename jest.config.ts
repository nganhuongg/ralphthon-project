import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        // ts-jest needs these even if tsconfig.json has them — explicit is safer
        strict: true,
        esModuleInterop: true,
        moduleResolution: 'node',
      },
    }],
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  collectCoverageFrom: ['lib/**/*.ts', '!lib/**/*.d.ts'],
};

export default config;
