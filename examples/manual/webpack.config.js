const {DllReferencePlugin} = require('webpack')
const {resolve, join} = require('path')
const outputPath = resolve(__dirname, './output')
const entry = resolve(__dirname, './src/index.js')

const glob = require('flipfile/glob')()
const files = glob.readdirSync('output/*manifest.json', {})
const plugins = files.map(file => {
  return new DllReferencePlugin({
    context: '.',
    manifest: require(resolve(__dirname, file)),
  })
})

module.exports = {
  target: 'node',
  entry: {
    index: entry,
  },
  output: {
    path: outputPath,
    filename: '[name].js',
  },
  // plugins,
}
