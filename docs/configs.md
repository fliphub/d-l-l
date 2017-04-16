# 👾 minimal

```js
const DLL = require('d-l-l')
const configs = DLL.auto(config, __dirname)
```

# 🎚 common

```js
const DLL = require('d-l-l')

const dll = new DLL()
const configs = dll
  .dir(__dirname)
  .config(config)
  .find()
  .pkgDeps()
  .toConfig()

module.exports = configs
```


# 🕳 advanced

```js
const DLL = require('d-l-l')

const dll = new DLL()
const configs = dll
  .debug(true)
  // when used, returns original config
  .when(process.env.OG === true, (d) => d.og(false))
  // when true, force adds dll config
  .when(process.env.DLL === true, (d) => d.shouldBeUsed(true))
  .dir(__dirname)
  .config(config)
  .output('./dll-output-folder')
  .context('.')
  .everyX(100)
  .staleTime({days: 10})
  .lastModifiedFilter({days: 1})
  .find('src/**/*.js')
  .pkgDeps()
  .when(process.env.NODE_ENV === 'production',
    // if
    (d) => d.pkgDeps(['lodash', 'babel']),
    // else
    (d) => d.pkgDeps((deps, dev, all) =>
      deps.filter(dep => !['fliplog'].includes(dep)))
  )
  .toConfig()

module.exports = configs
```



### 🎛 multiple

> handle an array of webpack configs, flatten the result

```js
const configs = DLL.configs([config1, config2], (auto, config) => {
  return auto
    .dir(__dirname)
    .config(config)
    .find('src/**/*.js')
    .pkgDeps()
    .toConfig()
})
```



# [full react config](https://github.com/fliphub/d-l-l/tree/master/examples/frontend)

```js
const {resolve, join} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const DLL = require('d-l-l')

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
  .dir(__dirname)
  .config(config)
  .find()
  .pkgDeps()
  .toConfig()

module.exports = configs
```
