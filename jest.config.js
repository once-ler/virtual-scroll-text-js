const ignores = [
  '/node_modules/',
  '/fixtures/',
  '/__tests__/helpers/',
  '__mocks__',
]

const config = {
  setupFilesAfterEnv: ['./tests/jest.setup.js'],
  testURL: 'http://localhost',
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  collectCoverageFrom: ['src/**/*.+(js|jsx|ts|tsx)'],
  testMatch: ['**/__tests__/**/*.+(js|jsx|ts|tsx)'],
  testPathIgnorePatterns: [...ignores],
  coveragePathIgnorePatterns: [...ignores, 'src/(umd|cjs|esm)-entry.js$'],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  verbose: true
}

module.exports = {
  ...config,
  projects: []
}
