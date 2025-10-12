const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  coverageReporters: ['html', 'text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/test-setup.ts',
    '!src/**/main.ts',
    '!src/**/polyfills.ts',
    '!src/**/environments/**',
  ],
  moduleNameMapper: {
    '^@pago-py/shared-models$': '<rootDir>/../../libs/shared-models/src/index.ts',
  },
  testTimeout: 10000,
};
