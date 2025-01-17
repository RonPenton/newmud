// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
// https://mongoosejs.com/docs/jest.html
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: { 'ts-jest': { tsconfig: {}, babelConfig: 'babel.config.js' } },
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/test/',
        '<rootDir>/config',
        '/dist/'
    ],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
    moduleNameMapper: {
        '^.*\\.scss$': '<rootDir>/config/jest/SCSSStub.js',
        '\\.(css|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/config/jest/fileMock.js'
    },
    reporters: [
        'default'
    ],
    testPathIgnorePatterns: [
        '<rootDir>/dist',
        '/node_modules/',
        '/test_data/',
        '/config/'
    ],
    testRegex: '(/test/.*)\\.test.ts[x]?$',
    transformIgnorePatterns: [
        'node_modules/(?!@hedtech)'
    ]
  };
  