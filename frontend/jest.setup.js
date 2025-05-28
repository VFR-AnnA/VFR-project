// Add Jest setup code here
require('@testing-library/jest-dom');

// This file is run before each test file
// It's a good place to add global test setup

// Note: CSS modules are mocked via moduleNameMapper in jest.config.js

// Mock process.env.NODE_ENV for tests
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  configurable: true
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});