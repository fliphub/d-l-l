- `*` required
- `?` optional
- `⛓` [chainable](https://www.npmjs.com/package/flipchain) and returns the instance
- `🗯` arguments - if applicable
- `📘` example
- `🔙` return value
- `configs` instance of `DLL` with configs to export


# 🗝️
- [dir](#dir)
- [config](#config)
- [find](#find)
- [pkgDeps](#)
- [lastModifiedFilter](#)
- [debug](#)
- [toConfig](#)
- [staleTime](#)
- [everyX](#)
- [og](#)
- [cacheBustingFiles](#cacheBustingFiles)
- [context](#context)
- [shouldBeUsed](#shouldBeUsed)
- [clearCache](#clearCache)
- [auto (static)](#auto)
- [configs (static)](#configs)


## `dir`

❗ currently, for non-static functions, this has to be the first function called.
likely this will be improved with a minor refactor.

> `?⛓` directory to resolve paths to

#### 🗯 arguments
- ?directory
  - type: `string`
  - default: `process.cwd()`

#### 📘 example
```js
configs.dir(__dirname)
```



## `config`

> `*⛓` webpack config

#### 🗯 arguments
  - config
    - type: `object` [webpack config object](https://webpack.js.org/configuration/#components/sidebar/sidebar.jsx)

#### 📘 example
```js
const config = {
  context: './src',
  entry: { index: 'index.js' },
  output: { path: 'output', filename: '[name].js' }
}

const configs = DLL.config(config)
```



## `find`

> `?⛓` find files in src code, use them if they haven't been edited recently

#### 🗯 arguments
- ?glob
  - type: `string` [glob](http://www.globtester.com/)
  - default: `src/**/*.+(js|jsx|ts|tsx)`

#### 📘 example

default

```js
configs.find()
```

custom

```js
configs.find(`src/**/*.+(js|jsx|ts|tsx)`)
```



## `pkgDeps`

> `?⛓` loads dependencies, and optionally devDependencies from `package.json`

#### 🗯 arguments
- ?filterFn(`Array<?dependency: string>, Array<?devDependencies: string>, Array<?allDependencies: string>`)
  - type: `function`
  - default: `null`

#### 📘 example

default `package.dependencies`

```js
configs.pkgDeps()
```

with filter callback

```js
configs
  .pkgDeps((deps, dev, all) => {
    if (process.env.NODE_ENV === 'production') {
      return deps
    }
    return all.filter(dep => !['fliplog'].includes(dep))
  })
```


## `lastModifiedFilter`

> `?⛓` last modified specification filter for including files that don't change often when using [.find](#find)

#### 🗯 arguments
- type: `object` [fliptime#tillNowSatisfies](https://www.npmjs.com/package/fliptime#️-tillnowsatisfies)

#### 📘 example

[more on time specification obj](#time-specifications)

would filter [.find](#find) to include files that were last edited at least 1 day ago

```js
configs.lastModifiedFilter({days: 1})
```




## `debug`

> `?⛓` enables or disables debugging logs

[uses fliplog](https://github.com/fliphub/fliplog)

#### 🗯 arguments
- ?should
  - type: `boolean`

#### 📘 example
```js
configs.debug(true)
```






## `toConfig`

> `*` returns an array of webpack configs, your application config(s), alongside dll config(s) when needed

#### 🔙 returns
`Array<Object>` webpack configs

#### 📘 example

```js
module.exports = configs.toConfig()
```




----------


## `staleTime`

> `?` after a certain number of time since the last DLL build, build it again to keep it fresh

#### 🗯 arguments
- object
  - type: `object` [fliptime#tillNowSatisfies](https://www.npmjs.com/package/fliptime#️-tillnowsatisfies)
  - default: `{days: 1}`

#### 📘 example

[more on time specification obj](#time-specifications)

```js
configs.everyX(100)
```



## `everyX`

> `?` every X number of builds, rebuild the dll, clears the cache to keep it light

#### 🗯 arguments
- number
  - type: `number`
  - default: `33`

#### 📘 example

```js
configs.everyX(100)
```

<!-- [source][src-everyX] -->


## `og`

> when needed (e.g. testing time difference), for ease-of-use, this will return the original (og) config in [.toConfig()](#toConfig) regardless of the other settings

#### 🗯 arguments
- number
  - type: `number`
  - default: `33`

#### 📘 example

```js
configs.everyX(100)
```





## `cacheBustingFiles`

> `?` an array of absolute file paths that bust the cache when changed using [flipcache](https://www.npmjs.com/package/flipcache)

#### 🗯 arguments
- files
  - type: `array`
  - default: `[require.main.filename, resolve(dir, package.json)]`

#### 📘 example

```js
const {resolve} = require('path')
const res = rel => resolve(__dirname, rel)

const files = [res('./src/vendor.js'), res('./.babelrc')]
configs.cacheBustingFiles(files)
```

<!-- [source][src-cacheBustingFiles] -->

-------------

## `auto` (static)

> `?⛓` use all defaults, configure `config` & `dir`, call other required functions automatically

#### 🗯 arguments
  - `config`
    - type: `object`
  - [`dir`](#dir)

#### 🔙 returns
`Array<Object>` webpack configs

#### 📘 example

```js
const configs = DLL.auto(config, __dirname)
```

is the same as using the default values by calling each method manually

```js
const auto = new DLL()
const configs = auto
  .dir(__dirname)
  .config(config)
  .find()
  .pkgDeps()
  .toConfig()
```


## `configs` (static)

> for an array of configs

#### 🗯 arguments
  - `configs`
    - type: `array`
  - `cb` called for each config, same usage as the [api](#-api)
    - type: `function`

#### 🔙 returns
`Array<Object>` webpack configs (flattens the return array configs, since each config becomes an array itself to contain dll config when needed)

#### 📘 [see config for example on array of configs][docs-config]

[docs-config]: https://github.com/fliphub/d-l-l/wiki/%E2%9A%99-configs

------

## `context`

> `?⛓` `context` property for DLLPlugin

#### 🗯 arguments
- type: `string` path?? (docs do not seem to cover this)


[Webpack DLLPlugin source](https://github.com/webpack/webpack/blob/9cf5901f37c43e53e7adc831ff30a5a60d12c94e/lib/DllPlugin.js#L17) [Webpack DllReferencePlugin source](https://github.com/webpack/webpack/blob/93ac8e9c3699bf704068eaccaceec57b3dd45a14/lib/DllReferencePlugin.js)


## `shouldBeUsed`

> `?⛓` override whether to use dll plugin or not, force using or not

#### 🗯 arguments
- type: `boolean`

#### 📘 example

```js
const configs = dll.dir(__dirname).config(config).shouldBeUsed(true).toConfig()
```



## `clearCache`

> `?⛓` delete the cache files

#### 📘 example

```js
dll.clearCache()
```

----------


## time-specifications

> check that the difference is `equal or greater than` specification.

_(use only 1 property, all are `integers`)_
- longhand: `{seconds, hours, minutes, days, years}`
- shorthand: `{s, h, m, d, y}`

```js
// true: was >= 60 seconds ago
tillNowSatisfies(Date.now() - 60000, {seconds: 60})
```
