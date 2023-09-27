const path = require('path');

module.exports = {
  output: {
    path: path.join(__dirname, 'dist/'),
    filename: 'bundle.js',
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'src/'),
    },
    devMiddleware: {
      publicPath: 'http://localhost:4096/',
    },
    port: 4096,
    hot: true,
    // historyApiFallback: {
    //   index: 'index.html',
    // },
  },
};
