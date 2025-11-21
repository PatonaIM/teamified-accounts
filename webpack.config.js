module.exports = function (options, webpack) {
  const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
  ];

  return {
    ...options,
    externals: [
      // Exclude native modules from webpack bundling
      'argon2',
      'bcrypt',
      '@mapbox/node-pre-gyp',
      'node-pre-gyp',
      'mock-aws-s3',
      'aws-sdk',
      'nock',
      'pg',
      'pg-native',
      'pg-query-stream',
      'pg-hstore',
      'redis',
      'ioredis',
      'bull',
      'pdfkit',
    ],
    output: {
      ...options.output,
      libraryTarget: 'commonjs2',
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
    ],
    watchOptions: {
      ignored: ['**/node_modules', '**/frontend/**', '**/dist/**', '**/tests/**', '**/docs/**'],
    },
  };
};
