/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/$1',
    // Mock MediaPipe modules
    '@mediapipe/pose': '<rootDir>/__mocks__/@mediapipe/pose.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  // Add test match patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Explicitly set testPathIgnorePatterns to default value
  // to avoid issues with some built-in patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
  ],
  // Add mock for global objects like document and window
  globals: {
    'ts-jest': {
      isolatedModules: true,
    }
  },
  // Increase test timeout (default is 5s)
  testTimeout: 10000,
};

module.exports = config;