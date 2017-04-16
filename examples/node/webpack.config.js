const {resolve} = require('path')
const DLL = require('../../')
// const DLL = require('d-l-l')

// resolve paths
const dir = __dirname
const res = rel => resolve(dir, rel)
const outputPath = res('./output')
const entry = res('./src/index.js')

const config = {
  target: 'node',
  entry: {
    index: entry,
  },
  output: {
    path: outputPath,
    filename: '[name].js',
  },
}

const configs = new DLL()
  // good to play with
  // .debug(true)
  // .shouldBeUsed(true)
  // .og(true)
  .dir(__dirname)
  .config(config)
  .find('src/**/*.js')
  .pkgDeps()
  .toConfig()

module.exports = configs
