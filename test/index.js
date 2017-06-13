const test = require('ava')
const log = require('fliplog')
const DLL = require('../')

test('can instantiate', t => {
  const dll = new DLL()
  const glob = ['examples/frontend/**/*', '!(node_modules)', '!node_modules']
  const configs = dll
    // .debug()
    .pkg(require.resolve('../package.json'))
    // .shouldBeUsed(true)
    // .deps(['string-dependencies'])
    .dir(__dirname)
    .config({ output: __dirname + '/testout' })
    .find(glob, (abs, obj) => {
      if (abs.includes('node_modules')) return false
      if (abs.includes('jsx')) return true
    })
    .toConfig()

  log.fmtobj(configs).echo(false)
  t.true(Array.isArray(configs))
})
