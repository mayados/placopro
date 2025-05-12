import nextJest from 'next/jest';
import 'identity-obj-proxy';


const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      '^.+\\.css$': 'jest-transform-stub',  // Ignore les fichiers CSS


  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^swiper/react$': '<rootDir>/__mocks__/swiper/react.js',
    '^next/image$': '<rootDir>/__mocks__/next/image.js',
    '\\.(css|scss|sass)$': 'identity-obj-proxy',
  
    // Mock des modules (évite parse de .mjs ECM modules)
    '^swiper/modules$': '<rootDir>/__mocks__/swiper/modules.js',
    '^swiper/modules/.*$': '<rootDir>/__mocks__/swiper/modules.js',

    // Generics imports from swiper (without extensions)
    // MOCK pour tous les imports "swiper/css" (sans extension)
  '^swiper/css$': 'identity-obj-proxy',
  '^swiper/css/.*$': 'identity-obj-proxy',


  },
    transformIgnorePatterns: [
    "node_modules/(?!(swiper|ssr-window|dom7)/)",
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

export default createJestConfig(customJestConfig);