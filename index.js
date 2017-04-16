const {resolve, basename} = require('path')
const {DllReferencePlugin, DllPlugin} = require('webpack')
const ChainedMap = require('flipchain/ChainedMapExtendable')
const flipcache = require('flipcache')
const fliphash = require('fliphash')
const {isRel, write, exists} = require('flipfile')
const timer = require('fliptime')
const deepmerge = require('deepmerge')
const {
  tillNowSatisfies,
  uniq,
  lastModified,
  flatten,
  log,
} = require('./deps')

let cache
let hashcache

/**
 * gets modified time
 * absolute path
 * stores in cache to remember all edits
 *
 * @param  {GlobFile} file
 * @return {GlobFile}
 */
function saveModified(file) {
  // file data
  const modified = new Date(file.mtime).getTime()
  const abs = file.abs

  // keys
  const key = 'modifiedLog.' + fliphash(abs)
  const keyRecord = key + '.record'

  // if not set
  if (cache.has(key) === false) cache.set(key, {record: [], meta: {}})

  // add uniq records
  const record = cache.get(keyRecord)
  if (record.includes(modified) === false) record.push(modified)

  return file
}

/**
 * internally choose whether to make it an array and add dll plugin first
 * if there is no bundle built, then only export dll plugin
 * then run the build command again
 *
 * OR
 *
 * export both
 * and store the manifests
 */
class DLL extends ChainedMap {
  // --- setup ---

  /**
   * @param {any} parent
   * @return {DLL}
   */
  static init(parent) {
    return new DLL(parent)
  }

  /**
   * @param {any} parent
   */
  constructor(parent) {
    super(parent)

    timer.start('dll')

    this
      .extend([
        'og',
        'files',
        'deps',
        'refs',
        'dlls',
        'context',
        'pkg',
        'staleTime',
        'everyX',
        'shouldBeUsed',
      ])
      .og(false)
      .debug(false)
      .files([])
      .deps([])
      .refs([])
      .dlls([])
      .output('output')
      .context('.')
      .lastModifiedFilter({hours: 2})
      .staleTime({days: 1})
      .everyX(33)

    // this.files = new ChainedSet(this)
  }

  // --- building ---

  /**
   * @TODO:
   * - [ ] time globbing through 1000 files to check edited
   * - [ ] need to say how many bundles -
   *       default to 1 which means single arr entry
   *
   * @param {string} [findGlob=string]
   * @return {DLL}
   */
  find(findGlob = 'src/**/*.+(js|jsx|ts|tsx)') {
    const glob = require('flipfile/glob')

    if (findGlob) this.set('srcGlob', findGlob)

    const {srcGlob, lastModifiedFilter, dir} = this.entries()

    // call the glob
    const g = new glob.GlobSync(srcGlob, {stat: true, absolute: true})

    // filter results using stats
    const files = g
      .found
      .filter(abs => {
        // put as an object for use in saveModified & modifiedFilter
        const obj = {
          abs,
          stats: g.statCache[abs],
          mtime: g.statCache[abs].mtime,
        }

        // filter
        if (lastModifiedFilter(obj) === false) return false

        // save it to the cache
        saveModified(obj)

        return abs
      })

    // seemingly if you use glob readDirSync twice
    // it mutates the original array o.o
    return this.files(files.slice(0))
  }

  /**
   * dependencies, devDependencies
   * @param {Function<Array<?string>, Array<?string>> | Array<string>} [filter=null]
   * @return {DLL}
   */
  pkgDeps(filter = null) {
    const pkgPath = this.get('pkg')
    const pkg = require(pkgPath)

    const deps = Object.keys(pkg.dependencies || {})
    const dev = Object.keys(pkg.devDependencies || {})
    let all = deps

    if (filter !== null) {
      if (typeof filter === 'function') {
        all = filter(deps, dev, deps.concat(dev))
      }
      else if (Array.isArray(filter)) {
        all = filter
      }
    }

    return this.deps(all)
  }

  // --- dev/cache/debug ---

  /**
   * clears the cache
   * @see flipfile/del
   * @return {DLL}
   */
  clearCache() {
    const fs = require('flipfile/extra')
    const {removeSync} = fs

    removeSync(resolve(this.get('dir'), './.fliphub'))
    return this
  }

  /**
   * @param  {boolean} [should=true]
   * @return {DLL}
   */
  debug(should = true) {
    return this.set('debug', !!should)
  }

  /**
   * @param  {Array<string>} files file paths to bust cache on
   * @return {DLL}
   */
  cacheBustingFiles(files) {
    return this.set('cacheBustingFiles', files)
  }

  /**
   * @param  {Object} ago
   * @return {DLL}
   */
  lastModifiedFilter(ago) {
    return this.set('lastModifiedFilter', lastModified(ago))
  }

  /**
   * @private
   *
   * maps entries to manifest json
   * saves in cache file
   *
   * @see DLL.dllRefPlugins, DLL.dllPlugins, flipcache
   * @return {DLL}
   */
  saveManifests() {
    const {output, dir} = this.entries()

    // by ref
    const cacheManifests = cache.get('manifests')

    // map entry to manifest.json
    const manifests = Object.keys(this.entry()).map(entry => {
      // map to manifest json
      const file = resolve(output, entry + '-manifest.json')

      // resolve with clients directory
      const resolved = resolve(dir, file)

      // add to cached file
      cacheManifests.push(resolved)

      return resolved
    })

    // save
    this.set('manifests', manifests)

    // unique & persist the data
    cache.set('manifests', cacheManifests.filter(uniq)).write()

    return this
  }

  // --- data ---

  /**
   * @param  {string} dir
   * @return {DLL}
   */
  dir(dir) {
    // paths
    const file = resolve(dir, './.fliphub/manifests.json')
    const cachefile = resolve(dir, './.fliphub/manifestscache.json')
    const pkgPath = resolve(dir, './package.json')
    const webpackConfig = resolve(dir, './webpack.config.js')

    // store pkg path and dir
    this
      .set('pkg', pkgPath)
      .set('dir', dir)

    // only setup cache once
    if (cache !== null && cache !== undefined) return this

    cache = flipcache
      .to(file)
      .json()
      .load()
      .setIfNotEmpty('manifests', [])
      .setIfNotEmpty('modifiedLog', {})
      .setIfNotEmpty('builds', [])
      // .setIfNotEmpty('lastBuilt', Date.now())

    let busts = [require.main.filename, this.get('pkg')]
    if (exists(webpackConfig)) {
      busts.push(webpackConfig)
    }
    if (this.has('cacheBustingFiles') === true) {
      busts = busts.concat(this.get('cacheBustingFiles'))
    }

    log
      .emoji('cache')
      .blue('cacheBustingFiles:')
      .data({busts})
      .echo(this.get('debug'))

    hashcache = flipcache
      .hashCache(cachefile)
      .debug(this.get('debug'))
      .hash(dir)
      .bustOnChange(busts)
      .setContent(cache.toString())

    return this
  }

  /**
   * @param  {string} output
   * @return {DLL}
   */
  output(output) {
    if (isRel(output)) output = resolve(output)
    return this.set('output', output)
  }

  /**
   * @see DLL.ensureSetup, DLL.appConfig, DLL.dllConfig, DLL.output
   * @param  {Object} c
   * @return {DLL}
   */
  config(c) {
    this.ensureSetup()

    // set original
    this.set('appConfig', c)

    // deref
    const config = Object.assign({}, {}, c)
    config.entry = Object.assign({}, {}, config.entry)
    config.output = Object.assign({}, {}, config.output)

    // change entry to use the dll entries instead
    delete config.entry
    let outputPath = this.get('output')

    // clean output to use dll output
    if (config.output && config.output.path) {
      outputPath = config.output.path
      this.output(outputPath)
    }

    delete config.output

    // use dll output
    config.output = {
      path: outputPath,
      library: '[name]_dll_lib',
      filename: '[name].dll.js',
    }

    if (config.target === 'node') {
      this.set('node', true)
      config.output.libraryTarget = 'commonjs2'
    }


    // set it
    this.set('dllConfig', config)

    return this
  }

  // --- statics ---

  /**
   * @description for multiple configs
   * @param  {Array<Object>} configs
   * @param  {function} cb
   * @return {Array<Object>}
   */
  static configs(configs, cb) {
    const conf = configs.map(config => cb(new DLL(), config))
    return flatten(conf)
  }

  /**
   * @description for easy auto mode
   * @param  {Object} config
   * @param  {string} [dir=process.cwd()]
   * @return {Array<Object>}
   */
  static auto(config, dir = process.cwd()) {
    return new DLL()
      .dir(dir)
      .config(config)
      .find('src/**/*.+(js|jsx|ts|tsx)')
      .pkgDeps()
      .toConfig()
  }


  // --- webpack config ---


  /**
   * @private
   * @return {Object<vendor, internal>}
   */
  entry() {
    const {deps, files} = this.entries()

    log
      .data(files)
      .green('entry files')
      .echo(this.get('debug'))

    return {
      vendor: deps,
      internal: files,
    }
  }

  /**
   * @return {Array<DLLReferencePlugin>}
   */
  dllRefPlugins() {
    const plugins = this.get('manifests').map(file => {
      if (exists(file) === false) return undefined
      const args = {
        context: this.get('context'),
        manifest: require(file),
      }

      if (this.get('node') === true) {
        args.sourceType = 'commonsjs2'
      }

      return new DllReferencePlugin(args)
    })
    .filter(plugin => plugin !== undefined)

    if (plugins.length === 0) {
      log
        .bold('had no dll manifests')
        .data('they have been created, run build again to use them.')
        .echo(this.get('debug'))
    }

    return plugins
  }

  /**
   * @return {Array<DLLPlugin>}
   */
  dllPlugins() {
    const args = {
      // The path to the manifest file which maps between
      // modules included in a bundle and the internal IDs
      // within that bundle
      path: resolve(this.get('output'), './[name]-manifest.json'),
      // The name of the global variable which the library's
      // require function has been assigned to. This must match the
      // output.library option above
      name: '[name]_dll_lib',
    }

    return [
      new DllPlugin(args),
    ]
  }

  // --- analysis/determining/metadata ---

  /**
   * @return {DLL}
   */
  ensureSetup() {
    if (this.has('dir') === false) {
      console.log('make sure you set .dir, defaulting to process.cwd()')
      this.dir(process.cwd())
    }

    return this
  }

  /**
   * @TODO: these settings should be in interactive, and saved to pkgjson
   * decorate should call this... like in top todos
   * should be triggered by both configs
   *
   * @return {DLL}
   */
  build() {
    const build = {}
    build.dll = this.shouldBuildDLL()
    build.time = Date.now()

    cache.get('builds').push(build)
    cache.write()

    return this
  }

  /**
   * @private
   * @return {boolean}
   */
  shouldBuildDLL() {
    if (this.has('shouldBeUsed') === true) return this.get('shouldBeUsed')

    const staleTime = this.get('staleTime')
    const everyX = this.get('everyX')
    const builds = cache.get('builds')

    log
      .yellow('builds.length')
      .verbose(builds.length)
      .echo(this.get('debug'))

    // if we have no builds, build the first one
    if (builds.length === 0) {
      this.set('shouldBeUsed', true)
      return true
    }

    const index = builds.length - 1
    const last = builds[index]
    const {time, dll} = last

    const canBeUsed = hashcache.canBeUsed()

    log
      .yellow('second - hash')
      .verbose({index, last, canBeUsed})
      .echo(this.get('debug'))

    // require files changed etc
    if (canBeUsed === false) return true

    // if dll was not in last 10 builds
    if (builds.length >= everyX) {
      const dllInLastBuilds = builds
        .slice(-everyX)
        .map(build => !!build.dll)
        .includes(true)

      // @NOTE: think about this
      // this.clearCache()

      log
        .yellow('third - everyX')
        .verbose({dllInLastBuilds, everyX, minus: -everyX})
        .echo(this.get('debug'))

      if (dllInLastBuilds === false) {
        this.set('shouldBeUsed', true)
        return true
      }
    }

    log
      .yellow('fourth - diffs')
      .verbose({staleTime, time, tillNow: tillNowSatisfies(time, staleTime)})
      .echo(this.get('debug'))

    // check time diffs
    if (tillNowSatisfies(time, staleTime) === true) {
      this.set('shouldBeUsed', true)
      return true
    }

    const manifestFilesExist = !!cache.get('manifests').filter(exists).length

    log
      .yellow('fifth - manifests exist')
      .verbose({manifestFilesExist})
      .echo(this.get('debug'))

    if (manifestFilesExist === false) {
      this.set('shouldBeUsed', true)
      return true
    }

    this.set('shouldBeUsed', false)

    // default do not build
    return false
  }

  /**
   * optionally adds dll config
   * adds appConfig
   *
   * @see DLL.saveManifests
   * @see DLL.shouldBuildDLL
   * @see DLL.build
   * @see DLL.dllConfig
   * @see DLL.appConfig
   * @return {Array<WebpackConfigObject>}
   */
  toConfig() {
    if (this.get('og') === true) {
      log
        .yellow('og mode: returning original config')
        .echo(this.get('debug'))

      return [this.get('appConfig')]
    }

    const configs = []

    this.build()
    this.saveManifests()

    const shouldBuildDLL = this.shouldBuildDLL()

    log
      .green('shouldBuildDLL:')
      .data(shouldBuildDLL)
      .echo(this.get('debug'))

    if (shouldBuildDLL) configs.push(this.dllConfig())
    configs.push(this.appConfig())

    const ms = timer.stop('dll').msTook('dll')
    log
      .emoji('timer')
      .bold('d-l-l took: ' + ms + 'ms')
      .echo()


    return configs
  }

  // --- exports/transformed/results ---

  /**
   * @private
   * @see DLL.config, DLL.dllRefPlugins, DLL.dllConfig
   * @return {WebpackConfigObject}
   */
  appConfig() {
    const config = deepmerge(this.get('appConfig'), {
      plugins: [],
    })

    config.plugins = config.plugins.concat(this.dllRefPlugins())

    return config
  }

  /**
   * @NOTE seemingly there is an issue deepmerging these object
   *       plugin arrays if plugins is a single object in both
   *
   * @see DLL.entry, DLL.dllPlugins, DLL.config
   * @return {WebpackConfigObject}
   */
  dllConfig() {
    const config = deepmerge(this.get('dllConfig'), {
      entry: this.entry(),
      plugins: [],
    })

    config.plugins = config.plugins.concat(this.dllPlugins())

    return config
  }

  /**
   * https://github.com/webpack/docs/wiki/list-of-plugins#using-dlls-via-nodejs
   *
   * because dll references don't get required properly on node
   * @return {string} path to generated output
   */
  nodeEntry() {
    const glob = require('flipfile/glob')

    const output = this.get('output')
    const outputGlob = output + '/*.js'

    const files = cache
      .get('manifests')
      .map(manifest =>
        manifest
          .replace('-manifest', '.dll')
          .replace('.json', '.js'))
      .concat(glob.sync(outputGlob, {absolute: true}))
      // .concat(globfs().readdirSync(outputGlob, {}))

    const content = files
      .filter(file => !file.includes('node-entry'))
      .filter(uniq)
      .map(file => {
        const name = basename(file, '.js').replace('.dll', '_dll_lib')
        return `global["${name}"] = require("${file}")\n`
      }).join('')

    const nodeEntry = resolve(output, './node-entry.js')

    write(nodeEntry, content)

    return nodeEntry
  }
}

module.exports = DLL
