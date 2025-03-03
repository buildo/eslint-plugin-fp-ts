module.exports = {
  testEnvironment: 'node',
  testRegex: ['./tests/.+\\.test\\.ts$', './tests/.+\\.spec\\.ts$'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          target: 'es2019',
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
};
