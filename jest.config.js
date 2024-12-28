module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/test/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  testPathIgnorePatterns: ['<rootDir>/dist/'],
  transformIgnorePatterns: ["node_modules/(?!(opossum)/)"],
};