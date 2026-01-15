module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/server.js'
  ],
  testMatch: [
    '**/src/tests/**/*.test.js'
  ],
  watchman: false, // Disable watchman to avoid permission issues
  verbose: true
}