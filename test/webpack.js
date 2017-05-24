const { resolve } = require('path')
const test = require('ava')
const webpack = require('webpack')
const log = require('fliplog')
const DLL = require('../')
const pify = require('pify')
const { exists } = require('flipfile')
const compile = pify(webpack)

// @TODO also needs beforeEach to clear output

// test.beforeAll(t => {})

function getConfig() {
  return {
    target: 'web',
    entry: {
      index: [resolve(__dirname, './fixture/web.js')],
    },
    output: {
      publicPath: '/',
      path: resolve(__dirname, './test-output'),
      filename: '[name].js',
    },
  }
}

test('cache & output exist after initial build', async t => {
  t.plan(4)
  const dll = new DLL()
  const configs = dll
    .dir(__dirname)
    .config(getConfig())
    .deps(['chain-able'])
    .toConfig()

  const stats = await compile(configs)
  const files = [
    './test-output/vendor.dll.js',
    './test-output/vendor-manifest.json',
    './.fliphub/manifests.json',
    './.fliphub/manifestscache.json',
  ]
  files
    .map(file => resolve(__dirname, file))
    .map(file => exists(file))
    .forEach(file => t.true(file))
})

test('once built, config has DllReferencePlugin', async t => {
  // compile once
  const dll1 = new DLL()
  const configs1 = dll1
    .dir(__dirname)
    .config(getConfig())
    .deps(['chain-able'])
    .toConfig()
  await compile(configs1)

  // compile twice
  const dll2 = new DLL()
  const configs2 = dll2
    .dir(__dirname)
    .config(getConfig())
    .deps(['chain-able'])
    .toConfig()

  const { DllReferencePlugin } = webpack
  t.true(configs2.pop().plugins[0] instanceof DllReferencePlugin)
})
