module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testTimeout: 10000,
  globalTeardown: './jest.teardown.js',
  globalSetup: './jest.setup.js',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  verbose: true,
};