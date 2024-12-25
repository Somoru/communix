module.exports = {
  testEnvironment: 'node',
  
  testTimeout: 10000,
  
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testMatch: ['**/src/**/*.test.js'], // Add this line to include tests in the src directory
  verbose: true,
};