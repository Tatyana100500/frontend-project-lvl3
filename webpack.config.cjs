const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const webpack = require('webpack'); //to access built-in plugins
const path = require('path');
module.exports = {
  entry: '/src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index_bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    // Generate a base html file and injects all generated css and js files
    new HtmlWebpackPlugin({
      title: 'RSS Generator',
      template: 'index.html',
    }),
  ],
};
