const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customConfig = {
  // Default to node; component tests override via @jest-environment docblock
  testEnvironment: 'node',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^moment$': '<rootDir>/node_modules/moment/moment.js',
    // CSS / asset stubs (for component tests)
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg|ico)$': '<rootDir>/tests/__mocks__/fileMock.js',
  },

  testMatch: [
    // Legacy location (keep existing passing tests)
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.test.jsx',
    // New structured location
    '**/tests/**/*.test.js',
    '**/tests/**/*.test.jsx',
  ],

  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/tests/__mocks__/',
  ],

  setupFilesAfterEnv: [],

  coverageDirectory: 'coverage',

  collectCoverageFrom: [
    // Engine pure functions
    'utils/engines/**/*.js',
    // All API routes
    'app/api/**/*.js',
    // Utility modules
    'utils/db.js',
    'utils/schema.js',
    'utils/GeminiAIModal.js',
    // Dashboard components (logic-heavy ones)
    'app/dashboard/_components/ScoreCard.jsx',
    'app/dashboard/_components/SkillRadar.jsx',
    'app/dashboard/_components/AnalyticsChart.jsx',
    'app/dashboard/_components/InterviewItemCard.jsx',
    'app/dashboard/_components/RecommendationCard.jsx',
    // Exclusions
    '!**/*.config.js',
    '!**/node_modules/**',
    '!**/.next/**',
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
};

module.exports = createJestConfig(customConfig);
