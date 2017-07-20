const path = require('path')
const local = path.resolve.bind(path, __dirname)

module.exports = {
  entry: {
    app: local('client/vrt.jsx')
  },
  output: {
    path: local('.dist'),
    filename: '[name].js',
    publicPath: '/assets/scripts/bundle/'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015', 'react']
      }
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
}
