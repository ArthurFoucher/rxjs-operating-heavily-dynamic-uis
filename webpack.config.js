const path = require('path');

config = {
  entry: {
    main: ['./index.ts']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist/')
  },
  resolve: {
    // Add '.ts' and '.tsx' as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js'],
    alias: {}
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
          },
          'sass-loader?sourceMap'
        ]
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      }
    ]
  }
};

module.exports = config;
