export default {
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: { 
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(t|j)sx?$': 'babel-jest',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/services/generator/',
    '<rootDir>/app/api/__tests__/model.test.ts'
  ],
};