module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
moduleNameMapper: {
    '^.+\\.(css|less|scss|sass)$': '<rootDir>/src/tests/styleMock.js',
  },
};