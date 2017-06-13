const { resolve } = require('path')
const test = require('ava')
const webpack = require('webpack')
const log = require('fliplog')
const DLL = require('../')

// can do webpack with webpack api :success:
// @TODO also needs beforeEach to clear output

function getConfig() {
  return {
    target: 'web',
    entry: {
      index: ['./src/index.js'],
    },
    output: {
      publicPath: '/',
      path: resolve('./output'),
      filename: '[name].js',
    },
  }
}

test('works with nothing special for og mode', t => {
  const dll = new DLL()
  const configs = dll.dir(__dirname).config(getConfig()).toConfig()
  t.true(configs.length === 1)
  t.true(typeof configs.pop() === 'object')
})

test('config length is 2 when not build, & contains deps as entry', t => {
  const dll = new DLL()
  const configs = dll
    .dir(__dirname)
    .config(getConfig())
    .deps(['chain-able'])
    .toConfig()

  t.true(configs[0].entry.vendor[0] === 'chain-able')
  t.true(configs.length === 2)
})

test('dll config contains dllplugin', t => {
  const dll = new DLL()
  const configs = dll
    .dir(__dirname)
    .config(getConfig())
    .deps(['chain-able'])
    .toConfig()

  const { DllPlugin } = webpack
  t.true(configs[0].plugins[0] instanceof DllPlugin)
})

test.skip('config length is 1 when it should not build', t => {
  const dll = new DLL()
  const configs = dll
    .dir(__dirname)
    .shouldBeUsed(false)
    .config(getConfig())
    .deps(['chain-able'])
    .toConfig()

  t.true(configs.length === 1)
})

test.todo('cache exists after initial build')
test.todo('config length is 1 when build')
test.todo('dllRefPlugins')
test.todo('og returns original')
