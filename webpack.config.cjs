const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const webpack = require('webpack'); //to access built-in plugins
const path = require('path');
module.exports = {
  //entry: '/src/index.js',
  //output: {
    //path: path.resolve(__dirname, 'dist'),
    //filename: 'bundle.js'
  //},
  //mode: process.env.NODE_ENV || 'development',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-object-rest-spread']
          }
        }
      }
    ]
  },
  plugins: [
    // Generate a base html file and injects all generated css and js files
    new HtmlWebpackPlugin({
      title: 'RSS Generator',
      template: 'index.html',
    }),
  ],
};
