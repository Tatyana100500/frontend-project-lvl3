const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  //entry: 'index.js',
  //output: {
  //  path: __dirname + '/dist',
  //  filename: 'index_bundle.js'
  //},
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
