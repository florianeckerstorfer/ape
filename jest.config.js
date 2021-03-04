module.exports = {
  collectCoverage: true,
  coverageDirectory: "./coverage",
  collectCoverageFrom: [
    "src/**/*.{js,ts,jsx}",
    "!**/node_modules/**",
    "!**/vendor/**",
    "!**/__*__/**",
  ],
  testMatch: ["src/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/dist/"],
  testEnvironment: "node",
  preset: "ts-jest",
  transform: {
    ".(ts|tsx)": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js"],
  watchPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/dist/"],
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.json",
    },
  },
};
