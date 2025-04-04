/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

// /** @type {import('jest').Config} */
// const config = {
//   clearMocks: true,
//   testEnvironment: "jsdom",
//   transform: {
//     "^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
//   },
// };

// module.exports = config;

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  // Load jest.setup.js before each test
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],  
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }]
  }
};

module.exports = createJestConfig(customJestConfig);


