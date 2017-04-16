const {resolve, join} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const DLL = require('../../')
// const DLL = require('d-l-l')

// resolve paths for absolute paths
const dir = __dirname
const res = rel => resolve(dir, rel)
const outputPath = res('./output')
const entry = res('./src/index.js')
const src = res('./src')
const template = res('./src/index.html')

const config = {
  target: 'web',
  entry: {
    index: entry,
  },
  output: {
    publicPath: '/',
    path: outputPath,
    filename: '[name].js',
  },
  plugins: [new HtmlWebpackPlugin({template})],
  // babel loader only to keep it simple
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [src],
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },

  devServer: {
    contentBase: outputPath,
    compress: true,
    port: 9000,
  },
}

// const configs = DLL.auto(config, __dirname)
const auto = new DLL()
const configs = auto
  // good to play with
  // .debug(true)
  // .shouldBeUsed(true)
  // .og(true)
  .dir(__dirname)
  .config(config)
  .find()
  .pkgDeps()
  .toConfig()

module.exports = configs
