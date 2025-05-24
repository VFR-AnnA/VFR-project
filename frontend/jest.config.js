/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/$1',
    // Handle CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Fallback for CSS modules
    '\\.module\\.(css|less|scss|sass)$': '<rootDir>/node_modules/identity-obj-proxy',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      jsx: 'react',
      diagnostics: {
        ignoreCodes: [151001]
      }
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@testing-library)/)'
  ],
  // Add test match patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Ignore problematic paths
  modulePathIgnorePatterns: [
    '<rootDir>/services/generator/',
    '<rootDir>/app/api/__tests__/model.test.ts'
  ],
};

module.exports = config;