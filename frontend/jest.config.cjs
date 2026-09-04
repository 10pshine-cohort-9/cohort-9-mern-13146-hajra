module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss|sass)$': '<rootDir>/src/tests/styleMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/__tests__/**',
    '!src/setupTests.js',
    '!src/tests/**',
    '!src/main.jsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'],
};