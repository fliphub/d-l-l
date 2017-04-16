const {resolve, join} = require('path')
const {DllPlugin} = require('webpack')
const outputPath = resolve(__dirname, './output')

module.exports = {
  target: 'node',
  entry: {
    'lodash': ['lodash'],
    'kindof': ['flipchain', 'kind-of'],
  },

  output: {
    filename: '[name].bundle.js',
    path: outputPath,

    // The name of the global variable which the library's
    // require() function will be assigned to
    library: '[name]_dll_lib',
  },
  plugins: [
    new DllPlugin({
      // The path to the manifest file which maps between
      // modules included in a bundle and the internal IDs
      // within that bundle
      path: resolve(__dirname, 'output/[name]-manifest.json'),
      
      // The name of the global variable which the library's
      // require function has been assigned to. This must match the
      // output.library option above
      name: '[name]_dll_lib',
    }),
  ],
}
