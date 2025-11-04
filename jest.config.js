/** @type {import("jest").Config} **/
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: "node",
  extensionsToTreatAsEsm: ['.ts'], // Treat .ts files as ESM
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }], /*'ts-jest',*/
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    // Old mappings
    //'^@src/(.*)\\.js$': '<rootDir>/src/$1.ts',
    // '^(.*)\\.js$': '$1', // Rewrite .js imports to TS files for ts-jest
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
};