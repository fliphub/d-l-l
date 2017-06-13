const { resolve } = require('path')
const test = require('ava')
const log = require('fliplog')
const DLL = require('../')

const pkgPath = require.resolve('../package.json')
const root = resolve(__dirname, '../')

test('pkg can be set', t => {
  const dll = new DLL().pkg(pkgPath)
  t.true(dll.get('pkg') === pkgPath)
})

// should use read-pkg-up
test('pkg defaults to correct path', t => {
  const dll = new DLL().dir(root)
  t.true(dll.get('pkg') === pkgPath)
})

test('pkg deps default to bundled', t => {
  const dll = new DLL().dir(root).pkgDeps()
  t.true(dll.get('deps')[0] === 'chain-able')
})

test('pkg deps can be an array', t => {
  const dll = new DLL().dir(root).pkgDeps(['chain-able'])
  t.true(dll.get('deps')[0] === 'chain-able')
})

test('pkg deps can be filtered', t => {
  const dll = new DLL().dir(root).pkgDeps((deps, dev, all) => {
    return all.filter(dep => /flipfile/.test(dep))
  })

  t.true(dll.get('deps')[0] === 'flipfile')
})
