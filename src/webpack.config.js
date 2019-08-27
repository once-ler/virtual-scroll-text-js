const path = require('path')
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")

module.exports = {
  context: path.resolve(__dirname, '.'),
  entry: {
    vscrolltext: './index.js'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'virtual-scroll-text.js',
    library: 'VirtualScrollText',
    libraryExport: 'default',
    libraryTarget: 'umd'
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true // set to true if you want JS source maps
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },      
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
