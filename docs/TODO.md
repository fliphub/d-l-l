# code
- [ ] split index.js into multiple files

# perf
- [x] auto clearCache everyX 

# properties
- [ ] https://github.com/webpack/webpack/blob/fca5a2dfaab1fb71598d784e9f8972a663cfbf27/test/configCases/dll-plugin/1-use-dll/webpack.config.js
- [ ] manifest filename configurable
- [ ] rest of configs
- [ ] add different output, if .output does not cover it

# flags
- allow flags such as --nocache, --debug, --clearcache, ~--config

# fancy
- [ ] use flipscript.Remember for auto progress bar

# safety & smart-ish
- [ ] should detect symlinks
- [ ] should handle errors

# deps
- [x] read from package json for node_modules,
- [ ] should extract deps from src with depsExtractor
```js
const DepsExtractor = require('depflip')

const extractor = new DepsExtractor()
extractor.usingGlob('src/*.js')
console.log(extractor.onlyInternal())
```

# cli
- [ ] use flipcli to
  - [ ] confirm which files to include, with checkboxes
  - [ ] add config to pkgjson
  - [ ] read pkgjson configs
  - [ ] add basic ops
    - [ ] clear cache
    - [ ] rebuild

# misc
- [x] autorebuild vendor every X time
- [x] should search with glob-fs for files that are not modified
- [x] log modifications with flipcache for a modification log history to determine when and how often files are edited
