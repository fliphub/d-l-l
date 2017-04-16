# ⚡🤸 d-l-l

[![NPM version][d-l-l-npm-image]][d-l-l-npm-url]
[![MIT License][license-image]][license-url]
[![fliphub][gitter-badge]][gitter-url]
[![flipfam][flipfam-image]][flipfam-url]

[d-l-l-npm-image]: https://img.shields.io/npm/v/d-l-l.svg
[d-l-l-npm-url]: https://npmjs.org/package/d-l-l
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: https://spdx.org/licenses/MIT
[gitter-badge]: https://img.shields.io/gitter/room/fliphub/pink.svg
[gitter-url]: https://gitter.im/fliphub/Lobby
[flipfam-image]: https://img.shields.io/badge/%F0%9F%8F%97%20%F0%9F%92%A0-flipfam-9659F7.svg
[flipfam-url]: https://www.npmjs.com/package/flipfam

> easy, automatic, optimized dll config handler for webpack


## 📦 install
```bash
yarn add d-l-l --dev
npm i d-l-l --save-dev
```

### [📘 examples](https://github.com/fliphub/d-l-l/tree/master/examples)
- [react/inferno](https://github.com/fliphub/d-l-l/tree/master/examples/frontend)
- [node](https://github.com/fliphub/d-l-l/tree/master/examples/node)
#### [🌐 full api](https://github.com/fliphub/d-l-l/wiki/%F0%9F%8C%90-api)
#### [⚙ advanced config examples][docs-config]
#### [🔗 read more webpack dll plugins][docs-resources]


## 👋 intro

Webpack's [Dll and DllReference plugins][docs-resources] are a way to split a large JavaScript project into multiple bundles which can be compiled independently. They can be used to [optimize build times][docs-ss] (both full and incremental) and improve caching for users by putting code which changes infrequently into separate "library" bundles. [- Robert Knight](https://robertknight.github.io/posts/webpack-dll-plugins/ "Dynamically Linked Library")

Unfortunately, the DLL plugins come with some problems. 

ℹ️️ This package aims to provide solutions for them by allowing you to pass in any existing webpack config, then get it back decorated with dll-reference-plugins and ([only when needed][docs-how]) a whole dll-plugin-only config prepended!


### ❎ problems with dll plugin:
  - can be a pain to configure
  - requires manually adding plugins, and the entry points in your source code alongside the package dependencies
  - requires multiple config files
  - requires multiple build scripts
  - requires manual cache busting when you change code, which makes it difficult to dynamically include code that does not often change
  - does not work without even more configuration on nodejs

### ✅ solution
  - [no need][docs-how] to have double config files or double build scripts just for dll
  - [adding files][docs-find] [that do not change often][docs-lastmodified]
  - [adding package dependencies][docs-pkg] with easy filtering
  - [easy (even one line) setup][docs-auto]
  - [clearing the cache automatically when needed][docs-how]

## 🖼️ screenshots

##### without d-l-l
<img width="356" alt="without d-l-l manual" src="https://cloud.githubusercontent.com/assets/4022631/25068619/3008b32c-221e-11e7-8467-267e3827e8c9.png">


##### with d-l-l
<img width="228" alt="with-d-l-l" src="https://cloud.githubusercontent.com/assets/4022631/25068618/300768a0-221e-11e7-9f89-cf19885dea98.png">


## ❔ how

Webpack allows exporting an array of configs, so when required, a DLL-only config is created using the provided config(s) & prepended to the array of configs.

Cache files are created in a `.fliphub` folder (_can be safely added to gitignore, similar to [.happypack][happypack-cache] or similar_).
This helps to provide some smart-ish checks:

_✚ = (dll config will be prepended)_

0. when no cache exists, ✚
1. when there are no manifest files, ✚
2. when [cache-busting-files][docs-cache] change, the cache is busted and ✚
3. [every X (default 33) builds][docs-everyx] ✚
4. [after a day since the last build][docs-staletime] ✚

[see the src code][src-shouldBuildDLL]


## 📖 usage

```js
// webpack.config.js
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


[docs-resources]: https://github.com/fliphub/d-l-l/wiki/%F0%9F%94%97-resources
[docs-config]: https://github.com/fliphub/d-l-l/wiki/%E2%9A%99-configs
[docs-how]: https://github.com/fliphub/d-l-l/wiki/%E2%9A%A1%F0%9F%A4%B8-d-l-l#-how
[docs-ss]: https://github.com/fliphub/d-l-l/wiki/%E2%9A%A1%F0%9F%A4%B8-d-l-l#%EF%B8%8F-screenshots
[docs-auto]: https://github.com/fliphub/d-l-l/wiki/%F0%9F%8C%90-api#auto-static
[docs-find]: https://github.com/fliphub/d-l-l/wiki/%F0%9F%8C%90-api#find
[docs-lastmodified]: https://github.com/fliphub/d-l-l/wiki/%F0%9F%8C%90-api#lastmodifiedfilter
[docs-how]: https://github.com/fliphub/d-l-l/wiki/%F0%9F%8C%90-api#find
[docs-pkg]: https://github.com/fliphub/d-l-l/wiki/%F0%9F%8C%90-api#pkgdeps
[docs-cache]: https://github.com/fliphub/d-l-l/wiki/%F0%9F%8C%90-api#cachebustingfiles
[docs-everyx]: https://github.com/fliphub/d-l-l/wiki/%F0%9F%8C%90-api#everyx
[docs-staletime]: https://github.com/fliphub/d-l-l/wiki/%F0%9F%8C%90-api#staletime

[src-shouldBuildDLL]: https://github.com/fliphub/d-l-l/tree/master/index.js#449

[happypack-cache]: https://github.com/amireh/happypack#cachepath-string
