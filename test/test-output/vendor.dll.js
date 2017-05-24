var vendor_dll_lib =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 29);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// 

const isNode =
  typeof process === 'object' &&
  typeof process.release === 'object' &&
  process.release.name === 'node'

if (isNode) {
  module.exports = __webpack_require__(13)
}
else {
  module.exports = __webpack_require__(4)
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const arrToObj = __webpack_require__(18)
const ChainedMap = __webpack_require__(5)
const Chainable = __webpack_require__(0)
const ChainedSet = __webpack_require__(2)
const toarr = __webpack_require__(20)
const {firstToUpper, addPrefix, removePrefix} = __webpack_require__(19)

// @TODO: extendBool which would add `no` firstChar.toUpperCase() + rest()
//
// maybe was doing this to bind the prefix variable?
// this.extendWith(methods.map((method) => (0, addPrefix)(method, prefix)), !val, prefix)

/**
 * @inheritdoc
 */
class ChainedMapExtendable extends ChainedMap {
  constructor(parent) {
    super(parent)

    if (parent && parent.has && parent.has('debug')) {
      this.debug(parent.get('debug'))
    }
    else {
      this.debug(false)
    }
  }

  // --- added new ChainedMapExtendable stuff ---

  // to more easily use different chains,
  // simply loop and bind methods...
  // useChains(chains) {}

  // --- helpers  ---

  /**
   * @desc return a value at the end of a chain regardless
   * @param  {any} value value to return at the end of a chain
   * @return {any}
   */
  return(value) {
    return value
  }

  // --- observe ---

  /**
   * @TODO should hash these callback properties
   * @TODO just throttle the `.set` to allow easier version of .commit
   * @TODO .unobserve
   *
   * @see https://medium.com/@benlesh/learning-observable-by-building-observable-d5da57405d87
   * @alias  on
   * @param  {string} properties
   * @param  {Function} cb
   * @return {Chain} @chainable
   */
  observe(properties, cb) {
    if (this.observers === undefined) {
      this.observers = new ChainedSet(this)
    }

    /* prettier-ignore */
    this.observers
      .add(changed => {
        // @TODO
        //  use `changed` to simply only update data with changed
        //  keep scoped data
        //  const {key, value} = changed

        const data = {}
        const props = toarr(properties)
        for (let i = 0; i < props.length; i++) {
          const prop = props[i]
          data[prop] = this.get(prop)
        }
        cb(data, this)
      })

    return this
  }

  /**
   * @see this.observe
   * @inheritdoc
   */
  set(key, value) {
    super.set(key, value)

    if (this.observers !== undefined) {
      this.observers.values().forEach(observer => observer({key, value}))
    }

    return this
  }

  // --- remap ---

  /**
   * @desc start remapping
   * @see this.remapKey
   * @param  {Object} obj
   * @return {Chain} @chainable
   */
  remapKeys() {
    return this.set('keymap', {})
  }

  /**
   * @TODO could also be an array of `from` and corresponds to an array of `to`
   * @param  {string} from property name
   * @param  {string} to property name to change key to
   * @return {Chain} @chainable
   */
  remapKey(from, to) {
    this.get('keymap')[from] = to
    return this
  }

  /**
   * @inheritdoc
   * @override
   * @desc if we have a keymap, remap, otherwise, just normal .from
   * @see FlipChain.from
   * @param  {Object} obj
   * @return {Chain} @chainable
   */
  from(obj) {
    if (this.has('keymap') === false) {
      return super.from(obj)
    }

    const keymap = this.get('keymap')
    const keys = Object.keys(obj)
    const mappedKeys = keys.map(key => {
      if (keymap[key]) return keymap[key]
      return key
    })

    for (let i = 0; i < keys.length; i++) {
      const key = mappedKeys[i]
      // skip if we already have it
      if (obj[key]) continue
      // otherwise, set it, can delete the old one
      obj[key] = obj[keys[i]]
    }

    return super.from(obj)
  }

  /**
   * @desc returns a dot chain
   * @param {string | null} [name=null]
   * @return {Object}
   */
  dotter(name = null) {
    if (name !== null) {
      console.log('chain:dotter', 'used name')
      return this._dotter(name)
    }

    return {
      name: dotName => this._dotter(dotName),
    }
  }

  /**
   * @protected
   * @TODO split into a class
   * @see FlipChain.when
   * @desc take a dot-prop (or normal string) name
   *       returns an object with `.dotted` & `.otherwise`
   * @param  {string} name
   * @return {Object}
   */
  _dotter(name) {
    let accessor = name
    let first = name
    let hasDot = name.includes('.')
    let value

    if (hasDot) {
      accessor = name.split('.')
      first = accessor.shift()
    }

    const dotted = {}

    dotted.dotted = cb => {
      if (hasDot === false) return dotted
      value = cb(first, accessor, name)
      return dotted
    }

    dotted.otherwise = cb => {
      if (dotted === true) return dotted
      value = cb(name)
      return dotted
    }

    // chain it
    dotted.dotted.otherwise = dotted.otherwise

    dotted.value = () => value

    return dotted
  }

  // --- original ChainedMapExtendable ---

  /**
   * @inheritdoc
   * @override
   * @desc same as ChainedMap.get, but checks for debug
   */
  get(name) {
    if (name === 'debug') return this._debug
    return super.get(name)
  }

  /**
   * @NOTE sets on store not this.set for easier extension
   * @param {boolean} [should=true]
   * @return {Chainable} @chainable
   */
  debug(should = true) {
    this._debug = should
    return this
    // return this.store.set('debug', should)
  }

  /**
   * @see ChainedMapExtendable.parent
   * @param  {Array<Object>} decorations
   * @return {ChainedMapExtendable}
   */
  decorateParent(decorations) {
    if (!this.decorated) this.decorated = new ChainedMap(this.parent)

    decorations.forEach(decoration => {
      const method = decoration.method
      const returnee = decoration.return || this.parent
      const key = decoration.key || method
      this.parent[method] = data => {
        this.set(key, data)
        return returnee
      }
    })

    return this
  }

  /**
   * @FIXME @TODO needs thought
   * @param {string} name
   * @param {Object} Chain
   * @return {ChainedMapExtendable}
   */
  addChain(name, Chain) {
    // making name available as a property on chainable
    if (typeof name !== 'string') Chain = name
    const chained = new Chain(this)
    name = chained.name || name
    this[name] = chained
    this.chains.push(name)
    return this
  }

  // --- extend extend ---

  /**
   * @param  {Array<string>} methods
   * @param  {string}  name
   * @param  {Boolean} [thisArg=null]
   * @return {ChainedMap}
   */
  extendAlias(methods, name, thisArg = null) {
    methods.forEach(method => (this[method] = this[name].bind(thisArg || this)))
    return this
  }

  /**
   * @param {Array<string>} methods
   * @param {any} val
   * @param {string} [prefix='no']
   * @param {string} [inverseValue='todo']
   * @return {ChainedMapExtendable}
   */
  extendPrefixed(methods, val, prefix = 'no', inverseValue = 'todo') {
    this.extendWith(methods, val)
    this.extendWith(
      methods.map(method => addPrefix(method, prefix)),
      !val,
      prefix
    )
    return this
  }

  /**
   * @desc add methods for keys with default values,
   *       and inverse functions to set the value to the opposite
   * @param {Array<string>} methods
   * @param {any} val
   * @param {string} [prefix]
   * @return {ChainedMapExtendable}
   */
  extendWith(methods, val, prefix) {
    const objMethods = arrToObj(methods, val)
    const keys = Object.keys(objMethods)
    this.shorthands = [...this.shorthands, ...keys]
    keys.forEach(method => {
      // value = objMethods[method]
      this[method] = value => {
        if (value === undefined || value === null) value = val
        if (prefix) return this.set(removePrefix(method, prefix), value)
        return this.set(method, value)
      }
    })
    return this
  }

  // --- boolean & increment presets ---

  /**
   * @see ChainedMapExtendable.extendPrefixed
   * @param {Array<string>} methods
   * @param {any} val
   * @param {string} [prefix='no']
   * @return {ChainedMapExtendable}
   */
  extendBool(methods, val, prefix = 'no') {
    this.extendPrefixed(methods, !val, prefix)
    return this
  }

  /**
   * @see ChainedMapExtendable.extendWith
   * @param {Array<string>} methods
   * @return {ChainedMapExtendable}
   */
  extendFalse(methods) {
    this.extendWith(methods, false)
    return this
  }

  /**
   * @see ChainedMapExtendable.extendWith
   * @param {Array<string>} methods
   * @return {ChainedMapExtendable}
   */
  extendTrue(methods) {
    this.extendWith(methods, true)
    return this
  }

  /**
   * @description when called, increments the value
   * @param  {Array<string>} methods
   * @return {ChainedMap}
   */
  extendIncrement(methods) {
    // every time it is called, just increment
    // add to this.shorthands
    methods.forEach(method => {
      this.shorthands.push(method)
      this[method] = () => {
        let value = (this.get(method) | 0) + 1
        this.set(method, value)
        return this
      }
    })
    return this
  }

  /**
   * @description uses an object, loops through keys, adds method
   * @see ChainedMapExtendable.shorthands
   *
   * @param  {Object} methods
   * @return {ChainedMap}
   */
  extendDefault(methods) {
    this.shorthands = [...this.shorthands, ...methods]

    Object.keys(methods).forEach(method => {
      this[method] = (value = methods[method]) => this.set(method, value)
    })

    return this
  }
}

/**
 * @desc function callable ChainedMapExtendable
 * @param {Chainable | Object | null | *} [obj=null] parent when chainable, or `.from`
 * @param {Object | null | *} [from={}] `.from` when `obj` is `chainable`
 * @return {ChainedMapExtendable}
 */
function Chainables(obj = null, from = {}) {
  if (
    obj &&
    (obj instanceof Chainable ||
      obj instanceof Chainables ||
      obj.store !== undefined)
  ) {
    const chain = new ChainedMapExtendable(obj)
    if (from !== null) chain.from(from)
    return chain
  }
  return new ChainedMapExtendable().from(obj)
}

module.exports = ChainedMapExtendable


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

const Chainable = __webpack_require__(0)

/**
 * @tutorial https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
 * @type {Set}
 */
class ChainedSet extends Chainable {
  /**
   * @param {ChainedSet | Chainable | any} parent
   */
  constructor(parent) {
    super(parent)
    this.store = new Set()
  }

  /**
   * @param {any} value
   * @return {ChainedSet}
   */
  add(value) {
    this.store.add(value)
    return this
  }

  /**
   * @description inserts the value at the beginning of the Set
   * @param {any} value
   * @return {ChainedSet}
   */
  prepend(value) {
    this.store = new Set([value, ...this.store])
    return this
  }

  /**
   * @return {Array<any>}
   */
  values() {
    return [...this.store]
  }

  /**
   * @param {Array | Set} arr
   * @return {ChainedSet}
   */
  merge(arr) {
    this.store = new Set([...this.store, ...arr])
    return this
  }
}

module.exports = ChainedSet


/***/ }),
/* 3 */
/***/ (function(module, exports) {

let _debug = true

// @TODO convert forEach for faster loops
// import deepmerge from 'deepmerge'
function isMergeableObject(val) {
  var strType = Object.prototype.toString.call(val)

  return (
    // not null object
    val !== null &&
    typeof val === 'object' &&
    // object toString is not a date or regex
    strType !== '[object RegExp]' &&
    strType !== '[object Date]'
  )
}

function emptyTarget(val) {
  return Array.isArray(val) ? [] : {}
}

function cloneIfNecessary(value, optionsArgument) {
  var clone = optionsArgument && optionsArgument.clone === true
  return clone && isMergeableObject(value) ?
    deepmerge(emptyTarget(value), value, optionsArgument) :
    value
}

function defaultArrayMerge(target, source, optionsArgument) {
  var destination = target.slice()
  source.forEach((e, i) => {
    if (typeof destination[i] === 'undefined') {
      destination[i] = cloneIfNecessary(e, optionsArgument)
    }
    else if (isMergeableObject(e)) {
      destination[i] = deepmerge(target[i], e, optionsArgument)
    }
    else if (target.indexOf(e) === -1) {
      destination.push(cloneIfNecessary(e, optionsArgument))
    }
  })
  return destination
}

function mergeObject(target, source, optionsArgument) {
  var destination = {}
  if (isMergeableObject(target)) {
    Object.keys(target).forEach(key => {
      destination[key] = cloneIfNecessary(target[key], optionsArgument)
    })
  }
  Object.keys(source).forEach(key => {
    if (!isMergeableObject(source[key]) || !target[key]) {
      destination[key] = cloneIfNecessary(source[key], optionsArgument)
    }
    else {
      destination[key] = deepmerge(target[key], source[key], optionsArgument)
    }
  })
  return destination
}

function deepmerge(target, source, optionsArgument) {
  var array = Array.isArray(source)
  var options = optionsArgument || {arrayMerge: defaultArrayMerge}
  var arrayMerge = options.arrayMerge || defaultArrayMerge

  if (array) {
    return Array.isArray(target) ?
      arrayMerge(target, source, optionsArgument) :
      cloneIfNecessary(source, optionsArgument)
  }
  else {
    return mergeObject(target, source, optionsArgument)
  }
}

deepmerge.all = function deepmergeAll(array, optionsArgument) {
  if (!Array.isArray(array) || array.length < 2) {
    throw new Error(
      'first argument should be an array with at least two elements'
    )
  }

  // we are sure there are at least 2 values, so it is safe to have no initial value
  return array.reduce((prev, next) => {
    return deepmerge(prev, next, optionsArgument)
  })
}

// @TODO options for merging arr, and on any type combo
// const todoOpts = {
//   // when: { left(cb), right(cb) }
//   // whenLeft(cb): {}
//   objToArr: false, // not implemented
//   stringConcat: false, // not implemented
//   numberOperation: "+ * ^ toarr cb",
//   promises... wait until finished then call merge???
//   boolPrefer: 0, 1, true, false
// }

function eqq(arr1, arr2) {
  return arr1[0] === arr2[0] && arr1[1] === arr2[1]
}

function eqCurry(types) {
  return eqq.bind(null, types)
}

function getDefaults() {
  return {
    stringToArray: true,
    boolToArray: false,
    boolAsRight: true,
    ignoreTypes: ['null', 'undefined', 'NaN'],
    debug: true,
  }
}

// require('fliplog').fmtobj({types, options, obj1, obj2}).echo(false)
// require('fliplog')
//   .data({
//     boolbool: eq(['boolean', 'boolean']),
//     strstr: eq(['string', 'string']),
//     arrstr: eq(['array', 'string']),
//     strarr: eq(['string', 'array']),
//   })
//   .echo()

function getOpts(opts) {
  const defaults = getDefaults()
  const options = Object.assign(defaults, opts)
  return options
}

const isArr = Array.isArray
function dopemerge(obj1, obj2, opts = {}) {
  // if they are identical, fastest === check
  if (obj1 === obj2) return obj1

  // setup options
  const {ignoreTypes, stringToArray, boolToArray} = getOpts(opts)

  // setup vars
  let type1 = typeof obj1
  let type2 = typeof obj2
  if (isArr(obj1)) type1 = 'array'
  if (isArr(obj2)) type2 = 'array'
  const types = [type1, type2]

  // check one then check the other
  // @TODO might want to push undefined null nan into array but...
  if (ignoreTypes.includes(type1) === true) return obj2
  if (ignoreTypes.includes(type2) === true) return obj1

  const eq = eqCurry(types)

  // check types to prefer
  switch (true) {
    case eq(['boolean', 'boolean']): {
      return boolToArray ? [obj1, obj2] : obj2
    }
    case eq(['string', 'string']): {
      return stringToArray ? [obj1, obj2] : obj1 + obj2
    }
    case eq(['array', 'string']): {
      return obj1.concat([obj2])
    }
    case eq(['string', 'array']): {
      return obj2.concat([obj1])
    }
    default: {
      return deepmerge(obj1, obj2)
    }
  }
}

module.exports = dopemerge


/***/ }),
/* 4 */
/***/ (function(module, exports) {

/**
 * @type {Chainable}
 * @property {Chainable | any} parent
 */
class Chainable {
  /**
   * @param {Chainable | any} parent
   */
  constructor(parent) {
    this.parent = parent
  }

  /**
   * @since 0.4.0
   * @see Chainable.parent
   * @return {Chainable | any}
   */
  end() {
    return this.parent
  }

  /**
   * @since 0.4.0
   * @param  {any} key
   * @param  {Function} [trueBrancher=Function.prototype]
   * @param  {Function} [falseBrancher=Function.prototype]
   * @return {ChainedMap}
   */
  whenHas(
    key,
    trueBrancher = Function.prototype,
    falseBrancher = Function.prototype
  ) {
    if (this.has(key) === true) {
      trueBrancher(this.get(key), this)
    }
    else {
      falseBrancher(false, this)
    }
    return this
  }

  /**
   * @description
   *  when the condition is true,
   *  trueBrancher is called,
   *  else, falseBrancher is called
   *
   * @param  {boolean} condition
   * @param  {Function} [trueBrancher=Function.prototype]
   * @param  {Function} [falseBrancher=Function.prototype]
   * @return {ChainedMap}
   */
  when(
    condition,
    trueBrancher = Function.prototype,
    falseBrancher = Function.prototype
  ) {
    if (condition) {
      trueBrancher(this)
    }
    else {
      falseBrancher(this)
    }

    return this
  }

  /**
   * @since 0.5.0
   * @see ChainedMap.store
   * @return {number}
   */
  get length() {
    return this.store.size
  }

  /**
   * @since 0.3.0
   * @return {Chainable}
   */
  clear() {
    this.store.clear()
    return this
  }

  /**
   * @since 0.3.0
   * @description calls .delete on this.store.map
   * @param {string | any} key
   * @return {Chainable}
   */
  delete(key) {
    this.store.delete(key)
    return this
  }

  /**
   * @since 0.3.0
   * @param {any} value
   * @return {boolean}
   */
  has(value) {
    return this.store.has(value)
  }
}

module.exports = Chainable


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

const Chainable = __webpack_require__(0)
const MergeChain = __webpack_require__(6)

/**
 * @tutorial https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map
 * @inheritdoc
 * @type {Chainable}
 */
class ChainedMap extends Chainable {
  /**
   * @param {ChainedMap | Chainable | any} parent
   */
  constructor(parent) {
    super(parent)
    this.shorthands = []
    this.store = new Map()
    this.className = this.constructor.name

    // @TODO for wrapping methods to force return `this`
    // this.chainableMethods = []
  }

  /**
   * @since 0.7.0
   * @see this.set, this.get
   * @desc   tap a value with a function
   *         @modifies this.store.get(name)
   * @param  {string | any} name key to `.get`
   * @param  {Function} fn function to tap with
   * @return {Chain} @chainable
   */
  tap(name, fn) {
    const old = this.get(name)
    const updated = fn(old)
    return this.set(name, updated)
  }

  /**
   * @TODO needs improvements like parsing stringify
   *       since it is just .merge atm
   *
   * @desc checks each property of the object
   *       calls the chains accordingly
   *
   * @param {Object} obj
   * @return {Chainable} @chainable
   */
  from(obj) {
    Object.keys(obj).forEach(key => {
      const fn = this[key]
      const value = obj[key]

      if (this[key] && this[key] instanceof Chainable) {
        return this[key].merge(value)
      }
      else if (typeof this[key] === 'function') {
        // const fnStr = typeof fn === 'function' ? fn.toString() : ''
        // if (fnStr.includes('return this') || fnStr.includes('=> this')) {
        return this[key](value)
      }
      else {
        this.set(key, value)
      }
    })
    return this
  }

  /**
   * @description shorthand methods, from strings to functions that call .set
   * @param  {Array<string>} methods
   * @return {ChainedMap}
   */
  extend(methods) {
    this.shorthands = methods
    methods.forEach(method => {
      this[method] = value => this.set(method, value)
    })
    return this
  }

  /**
   * @description
   *   clears the map,
   *   goes through this properties,
   *   calls .clear if they are instanceof Chainable or Map
   *
   *
   * @see https://github.com/fliphub/flipchain/issues/2
   * @return {ChainedMap}
   */
  clear() {
    this.store.clear()
    Object.keys(this).forEach(key => {
      if (key === 'inspect' || key === 'parent') return
      if (this[key] instanceof Chainable) this[key].clear()
      if (this[key] instanceof Map) this[key].clear()
    })

    return this
  }

  /**
   * @description spreads the entries from ChainedMap.store (Map)
   * @return {Object}
   */
  entries() {
    const entries = [...this.store]
    if (!entries.length) {
      return null
    }
    return entries.reduce((acc, [key, value]) => {
      acc[key] = value
      return acc
    }, {})
  }

  /**
   * @description spreads the entries from ChainedMap.store.values
   * @return {Array<any>}
   */
  values() {
    return [...this.store.values()]
  }

  /**
   * @param  {any} key
   * @return {any}
   */
  get(key) {
    return this.store.get(key)
  }

  /**
   * @description sets the value using the key on store
   * @see ChainedMap.store
   * @param {any} key
   * @param {any} value
   * @return {ChainedMap}
   */
  set(key, value) {
    this.store.set(key, value)
    return this
  }

  /**
   * @description concats an array `value` in the store with the `key`
   * @see ChainedMap.store
   * @param {any} key
   * @param {Array<any>} value
   * @return {ChainedMap}
   */
  concat(key, value) {
    if (!Array.isArray(value)) value = [value]
    this.store.set(key, this.store.get(value).concat(value))
    return this
  }

  /**
   * @description appends the string value to the current value at the `key`
   * @see ChainedMap.concat
   * @param {any} key
   * @param {string | Array} value
   * @return {ChainedMap}
   */
  append(key, value) {
    let existing = this.store.get(value)

    if (Array.isArray(existing)) {
      existing.push(value)
    }
    else {
      existing += value
    }

    this.store.set(key, existing)

    return this
  }

  /**
   * @TODO needs to pass in additional opts somehow...
   *       ...as second arg? on instance property?
   *
   * @description merges an object with the current store
   * @see dopemerge, MergeChain
   * @param {Object} obj
   * @return {ChainedMap} @chainable
   */
  merge(obj) {
    MergeChain.init(this).merge(obj)
    return this
  }

  /**
   * @description
   *  goes through the maps,
   *  and the map values,
   *  reduces them to array
   *  then to an object using the reduced values
   *
   * @param {Object} obj
   * @return {Object}
   */
  clean(obj) {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key]
      if (value === undefined || value === null) return acc
      if (Array.isArray(value) && !value.length) return acc
      if (
        Object.prototype.toString.call(value) === '[object Object]' &&
        Object.keys(value).length === 0
      ) {
        return acc
      }

      acc[key] = value

      return acc
    }, {})
  }
}

module.exports = ChainedMap


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

const dopemerge = __webpack_require__(3)
const Chainable = __webpack_require__(0)

class MergeChain extends Chainable {
  /**
   * @param  {Chainable} parent required, for merging
   * @return {MergeChain} @chainable
   */
  static init(parent) {
    return new MergeChain(parent)
  }

  constructor(parent) {
    super(parent)
    this.store = new Map()
    this.set = (name, val) => {
      this.store.set(name, val)
      return this
    }
    this.get = name => this.store.get(name)
  }

  /**
   * @desc can pass in a function same as .merge,
   *       but say, .set instead of merge
   *
   * @param  {Function} cb
   * @return {MergeChain} @chainable
   */
  onExisting(cb) {
    return this.set('onExisting', cb)
  }

  /**
   * @desc can pass in a function to check values, such as ignoring notReal
   * @example .onValue(val => val !== null && val !== undefined)
   * @param  {Function} cb
   * @return {MergeChain} @chainable
   */
  onValue(cb) {
    return this.set('onValue', cb)
  }

  /**
   * @desc merges object in, goes through all keys, checks cbs, dopemerges
   * @param  {Object} obj2 object to merge in
   * @return {MergeChain} @chainable
   */
  merge(obj2) {
    let onValue = this.get('onValue')
    let onExisting = this.get('onExisting')

    let obj = obj2

    // @TODO do this
    // if (obj2 instanceof Chainable) {
    //   // is map
    //   if (obj2.entries) obj2 = obj2.entries()
    //   // set, much easier to merge
    //   // else if (obj2.values)
    // }

    // const onChildChain = this.get('onChildChain') (is just .merge)
    // const onDefault = this.get('onDefault') (is .set)

    // for (let i = 0; i < keys.length; i++) const key = keys[i]
    Object.keys(obj).forEach(key => {
      const value = obj[key]

      // use onValue when set
      if (onValue !== undefined && onValue(obj[key], key) === false) {
        return false
      }

      // when property itself is a Chainable
      if (this.parent[key] && this.parent[key] instanceof Chainable) {
        return this.parent[key].merge(value)
      }

      // check if it is shorthanded
      if (this.parent.shorthands.includes(key)) {
        // has a value already
        if (this.parent.has(key) === true) {
          // get that value
          const existing = this.parent.get(key)

          // setup vars
          let merged = existing

          // if we have a cb, call it
          // default to dopemerge
          if (onExisting === undefined) {
            merged = dopemerge(existing, value)
          }
          else {
            merged = onExisting(existing, value)
          }

          return this.parent[key](merged)
        }

        return this.parent[key](value)
      }

      // when fn is a full method, not an extended shorthand
      if (this.parent[key] !== undefined) {
        return this.parent[key](value)
      }

      // default to .set on the store
      return this.parent.set(key, value)
    })

    return this.parent
  }
}

module.exports = MergeChain


/***/ }),
/* 7 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(28);

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = __webpack_require__(27);

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9), __webpack_require__(7)))

/***/ }),
/* 9 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

// core
const ChainedMapExtendable = __webpack_require__(1)
const Chainable = __webpack_require__(0)
const ChainedMap = __webpack_require__(5)
const MergeChain = __webpack_require__(6)
const ChainedSet = __webpack_require__(2)
// extended
const TypeChain = __webpack_require__(17)
const ImmutableChain = __webpack_require__(16)
const ChildChain = __webpack_require__(14)
const dopemerge = __webpack_require__(3)

// export
const exp = TypeChain
exp.Chainable = Chainable
exp.ChainedSet = ChainedSet
exp.ChainedMap = ChainedMap
exp.MergeChain = MergeChain
exp.ChainedMapExtendable = ChainedMapExtendable
exp.Chain = TypeChain
exp.ImmutableChain = ImmutableChain
exp.ChildChain = ChildChain
exp.dopemerge = dopemerge
module.exports = exp


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(11)
var ieee754 = __webpack_require__(21)
var isArray = __webpack_require__(25)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(9)))

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

const Chainable = __webpack_require__(4)

/**
 * @type {Chainable}
 * @property {Chainable | any} parent
 */
class ChainableNodeJS extends Chainable {
  /**
   * @param {Chainable | any} parent
   */
  constructor(parent) {
    super(parent)
    this.inspect = __webpack_require__(22).inspectorGadget(this, [
      'parent',
      'workflow',
    ])
  }

  /**
   * @since 0.5.0
   * @type {generator}
   * @see https://github.com/sindresorhus/quick-lru/blob/master/index.js
   */
  // * [Symbol.iterator](): void {
  //   for (const item of this.store) {
  //     yield item
  //   }
  // }
}

module.exports = ChainableNodeJS


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

const ChainedMap = __webpack_require__(1)

class ChildChain extends ChainedMap {
  constructor(parent) {
    super(parent)
    this.store = parent.store
    this.set = parent.set.bind(parent)
    this.get = parent._get.bind(parent)
    this.has = parent.has.bind(parent)
    // this.childStore = new Map()
  }
}

ChildChain.ChildChain = ChildChain
module.exports = ChildChain


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

const ChainedSet = __webpack_require__(2)
const ChainedMap = __webpack_require__(1)

class FactoryChain extends ChainedMap {
  constructor(parent) {
    super(parent)

    this.data = {}
    this.factory()
    super.extend(['optional', 'required', 'chainUpDown'])
    super.extendIncrement(['chainLength'])
    this._calls = new ChainedSet(this)
  }

  // chain back up to parent for any of these
  // should have a debug log for this
  chainUpDowns(methods) {
    methods.forEach(method => {
      this[method] = (arg1, arg2, arg3, arg4, arg5) => {
        this.end()
        return this.parent[method](arg1, arg2, arg3, arg4, arg5)
      }
    })
    return this
  }

  _call(name) {
    this._calls.add(name)
    return this
  }

  extend(props) {
    super.extend(props)
    return this
  }

  props(names) {
    names.forEach(name => this.prop(name))
    return this
  }

  onDone(cb) {
    return this.set('onDone', cb)
  }

  magicReturn() {
    if (this._calls.length === this.get('chainLength')) {
      return this.end()
    }
    return this
  }

  prop(name, cb = null) {
    this.chainLength()

    // so if we call a property twice,
    // chain back up to parent,
    // add a new chain
    if (this[name] !== undefined && this.has('chainUpDown') === true) {
      this.end()
      return this.get('chainUpDown')()[name](cb)
    }

    // @TODO need to spread as needed
    this[name] = args => {
      if (cb !== null) cb(args)
      else this.data[name] = args

      this._call(name)

      return this.magicReturn()
    }
    return this
  }

  getData(prop = null) {
    if (prop !== null) {
      return this.data[prop]
    }
    return this.data
  }

  factory(obj = {}) {
    this.end = arg => {
      if (obj.end !== undefined) {
        const ended = obj.end(this.data, this.parent, this, arg)
        if (ended && ended !== this) return ended
      }
      else if (this.has('onDone')) {
        const ended = this.get('onDone')(this.data, this.parent, this, arg)
        if (ended && ended !== this) return ended
      }

      return this.parent
    }

    return this
  }
}

FactoryChain.FactoryChain = FactoryChain
module.exports = FactoryChain


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

const ChainedMap = __webpack_require__(1)

let MAP = Map
// try {
//   require.resolve('immutable')
//   const immutablejs = require('immutable')
// }
// catch (e) {
//   // use normal map
// }

// @TODO:
//  - set the type to use,
//  - auto extend methods of that type
//  - do not spread args
// https://facebook.github.io/immutable-js/docs/#/Collection
class ImmutableChain extends ChainedMap {
  // @TODO not sure parent is best
  constructor(parent = new Map()) {
    super(parent)
    this.immutableStore = parent
  }

  delete(key) {
    if (this.immutableStore !== undefined) {
      this.immutableStore = this.immutableStore.delete(key)
    }

    super.delete(key)
    return this
  }

  set(key, value) {
    if (this.immutableStore !== undefined) {
      this.immutableStore = this.immutableStore.set(key, value)
    }
    super.set(key, value)
    return this
  }

  merge(obj) {
    if (this.immutableStore !== undefined) {
      this.immutableStore = this.immutableStore.merge(obj)
    }
    super.merge(obj)
    return this
  }

  equals(obj) {
    return this.immutableStore.equals(obj)
  }

  // getIn(...args) {
  //   return this.immutableStore.getIn(...args)
  // }
  // setIn(...args) {
  //   this.immutableStore = this.immutableStore.setIn(...args)
  //   return this
  // }
  // toJS(computed = false): boolean {
  //   return this.immutableStore.toJS(computed)
  // }
}

ImmutableChain.ImmutableChain = ImmutableChain
module.exports = ImmutableChain


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

const dopemerge = __webpack_require__(3)
const ChainedMap = __webpack_require__(1)
const FactoryChain = __webpack_require__(15)

class TypeChainError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    }
    else {
      this.stack = new Error(message).stack
    }
  }
}

class TypeChain extends ChainedMap {
  constructor(parent) {
    super(parent)
  }

  validators(validators) {
    if (this.has('validators')) {
      const merged = dopemerge(this.get('validators'), validators)
      return this.set('validators', merged)
    }
    return this.set('validators', validators)
  }

  /**
   * @desc add a validated function to do .set
   * @param  {string | null} [name=null] shorthand for .name
   * @return {FactoryChain} @chainable
   */
  typed(name = null) {
    const typed = new FactoryChain(this)

    const chain = typed
      .prop('type')
      .prop('name')
      .prop('onInvalid')
      .prop('onValid')
      .chainUpDown(this.typed)
      .chainUpDowns(['typed'])
      .onDone(data => {
        this.extendTyped(data.name, data.type, data.onInvalid, data.onValid)
      })

    if (name !== null && typeof name === 'string') {
      chain.name(name)
      return chain
    }
    if (name !== null && typeof name === 'object') {
      return chain.merge(name).end()
    }

    return chain
  }

  // or fn
  extendTyped(name, type, onInvalid = null, onValid = null) {
    this[name] = arg => {
      const typeError = () => {
        const errorMsg = `[typof: ${typeof name}, name: ${name}] was not of type ${type}`
        return new TypeChainError(errorMsg)
      }
      if (onInvalid === null) {
        onInvalid = e => {
          throw typeError()
        }
      }
      const validator = typeof type === 'string' ?
        this.get('validators')[type] :
        type

      if (typeof validator !== 'function') {
        console.error({validators: this.get('validators')}, '\n\n')
        throw new TypeChainError(`${validator} for ${type} was not a function`)
      }

      let valid = true

      try {
        valid = validator(arg)
      }
      catch (e) {
        valid = e
      }

      if (this.get('debug') === true) {
        // console.log('validating: ', {valid, arg, name})
      }

      // .error, .stack, === 'object'
      if (valid === null || valid === true) {
        this.set(name, arg)
        if (onValid !== null) onValid(arg, this, typeError())
      }
      else {
        onInvalid(arg, this)
      }
      return this
    }
  }
}

TypeChain.TypeChain = TypeChain
module.exports = TypeChain


/***/ }),
/* 18 */
/***/ (function(module, exports) {

const isArr = Array.isArray
const isObj = o => o && typeof o === 'object'

function defaultKeyFn({val, i, array, obj}) {
  // if (typeof val === 'object') {
  //   obj = Object.assign(obj, val)
  // } else if (typeof val === 'string') { }
  return val
}
function defaultValFn({val, i, array, obj}) {
  return val
}

// array items become object values,
// fn maps items to keys
function arrToObj(array, keyValFns = {}) {
  const key = keyValFns.keyFn || defaultKeyFn
  const val = keyValFns.valFn || defaultValFn

  const obj = {}
  if (!isArr(array) && isObj(array)) return array
  const len = array.length
  for (let i = 0; i < len; i++) {
    const _val = val({val: array[i], i, array, obj})
    const _key = key({val: _val, i, array, obj})
    obj[_key] = _val
  }
  return obj
}

// @example:
// var array = ['eh', 'canada']
// valAsKey(array, 'woot')
// {eh: 'woot', canada: 'woot'}
function valAsKey(array, fn) {
  return arrToObj(array, {
    valFn: () => undefined,
    keyFn: ({i}) => (typeof fn === 'function' ? fn(i) : fn || array[i]),
  })
}

// @example:
// var array = ['eh', 'canada']
// valAsVal(array)
// {'1': 'eh', '2': 'canada'}
function valAsVal(array, fn) {
  return arrToObj(array, {
    valFn: ({i, val}) => (typeof fn === 'function' ? fn(val, i) : fn || i),
    keyFn: () => undefined,
  })
}

// is default...
function valAsKeyAndVal(array, fn) {
  return arrToObj(array, {
    valFn: defaultValFn,
    keyFn: defaultKeyFn,
  })
}

// function valAsValAndKey(array, fn) {}

arrToObj.valAsKey = valAsKey
arrToObj.valAsVal = valAsVal
arrToObj.valAsKeyAndVal = valAsKeyAndVal

module.exports = arrToObj


/***/ }),
/* 19 */
/***/ (function(module, exports) {

const firstToUpper = str => str.charAt(0).toUpperCase() + str.slice(1)

const addPrefix = (string, prefix) => prefix + firstToUpper(string)

function removePrefix(string, prefix) {
  if (string.indexOf(prefix) === 0) string = string.slice(prefix.length)
  return string.charAt(0).toLowerCase() + string.slice(1)
}

module.exports = {
  firstToUpper,
  addPrefix,
  removePrefix,
}


/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = function toArr(data, opts = null) {
  const defaults = {includeEmpty: false, keys: false, split: ','}
  if (opts) opts = Object.assign(defaults, opts)
  else opts = defaults
  const {includeEmpty, split, keys} = opts

  if (!data && !includeEmpty) return []
  if (Array.isArray(data)) return data

  if (typeof data === 'string') {
    if (typeof split === 'string' && data.includes(split)) {
      return data.split(split)
    }
    else if (Array.isArray(split)) {
      let splitData = []
      split.forEach(delimiter => {
        if (data.includes(delimiter)) {
          splitData = splitData.concat(data.split(delimiter))
        }
      })
      return splitData
    }
  }

  if (data && keys && typeof data === 'object') {
    return Object.keys(data)
  }
  else {
    return [data]
  }
}

module.exports.slice = Array.prototype.slice.call.bind(Array.prototype.slice)


/***/ }),
/* 21 */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

const util = __webpack_require__(8)
const inspector = __webpack_require__(24)
const inspectorGadget = __webpack_require__(23)

let custom = util.inspect.defaultOptions.customInspect
module.exports = {
  util,
  inspectorGadget,
  inspector,
  inspect: inspector,
  custom: (arg = false) => {
    if (arg !== true && arg !== false && arg !== null && arg !== undefined) {
      util.inspect.defaultOptions.customInspect = arg
    } else if (arg) {
      util.inspect.defaultOptions.customInspect = custom
    } else {
      util.inspect.defaultOptions.customInspect = false
    }
    return inspector
  },
}


/***/ }),
/* 23 */
/***/ (function(module, exports) {

// https://www.bennadel.com/blog/2829-string-interpolation-using-util-format-and-util-inspect-in-node-js.htm
const filter = [
  'helpers',
  'addDebug',
  'inspect',
  'emit',
  'on',
  'debugFor',
  'translator',
  'appsByName',

  // these ones we might want to toggle on and off
  'instance',
  'api',
  'evts',
  'hubs',
]
const inspectorGadget = (thisArg, moreFilters) => {
  return function(depth, options) {
    let toInspect = Object.keys(thisArg)
    .filter(key => !filter.includes(key))

    if (Array.isArray(moreFilters))
      toInspect = toInspect.filter(key => !moreFilters.includes(key))
    // else if (typeof moreFilters === 'function')
    //   toInspect = toInspect.map(key => moreFilters(key, this[key]))
    else if (typeof moreFilters === 'object') {
      // if (moreFilters.blacklist)
      if (moreFilters.whitelist) {
        toInspect = toInspect.filter(key => moreFilters.whitelist.includes(key))
      }
      // if (moreFilters.val) {
      //   return moreFilters.val
      // }
      // if (moreFilters.filter)
      // if (moreFilters.map)
    }

    let inspected = {}
    toInspect.forEach(key => {
      // @TODO: filter out .length on function...
      // let val = thisArg[key]
      // if (typeof val === 'function')
      inspected[key] = thisArg[key]
    })
    return inspected
  }
}

module.exports = inspectorGadget


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

const inspector = (msg, depth = 30, opts = {}) => {
  // allow taking in different depths
  if (!Number.isInteger(depth)) depth = 10
  const defaults = {
    depth,
    maxArrayLength: depth,
    showHidden: true,
    showProxy: true,
    colors: true,
  }
  opts = Object.assign(defaults, opts)

  const util = __webpack_require__(8)
  try {
    const inspected = util.inspect(msg, opts)
    return inspected
  } catch (e) {
    console.log(e)
    try {
      const stringify = __webpack_require__(26)
      const stringified = stringify(msg, null, '  ')
      return stringified
    } catch (error) {
      return msg
    }
  }
}

module.exports = inspector


/***/ }),
/* 25 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {(function (root, stringify) {
  /* istanbul ignore else */
  if (true) {
    // Node.
    module.exports = stringify();
  } else if (typeof define === 'function' && define.amd) {
    // AMD, registers as an anonymous module.
    define(function () {
      return stringify();
    });
  } else {
    // Browser global.
    root.javascriptStringify = stringify();
  }
})(this, function () {
  /**
   * Match all characters that need to be escaped in a string. Modified from
   * source to match single quotes instead of double.
   *
   * Source: https://github.com/douglascrockford/JSON-js/blob/master/json2.js
   */
  var ESCAPABLE = /[\\\'\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

  /**
   * Map of characters to escape characters.
   */
  var META_CHARS = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    "'":  "\\'",
    '"':  '\\"',
    '\\': '\\\\'
  };

  /**
   * Escape any character into its literal JavaScript string.
   *
   * @param  {string} char
   * @return {string}
   */
  function escapeChar (char) {
    var meta = META_CHARS[char];

    return meta || '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
  };

  /**
   * JavaScript reserved word list.
   */
  var RESERVED_WORDS = {};

  /**
   * Map reserved words to the object.
   */
  (
    'break else new var case finally return void catch for switch while ' +
    'continue function this with default if throw delete in try ' +
    'do instanceof typeof abstract enum int short boolean export ' +
    'interface static byte extends long super char final native synchronized ' +
    'class float package throws const goto private transient debugger ' +
    'implements protected volatile double import public let yield'
  ).split(' ').map(function (key) {
    RESERVED_WORDS[key] = true;
  });

  /**
   * Test for valid JavaScript identifier.
   */
  var IS_VALID_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

  /**
   * Check if a variable name is valid.
   *
   * @param  {string}  name
   * @return {boolean}
   */
  function isValidVariableName (name) {
    return !RESERVED_WORDS[name] && IS_VALID_IDENTIFIER.test(name);
  }

  /**
   * Return the global variable name.
   *
   * @return {string}
   */
  function toGlobalVariable (value) {
    return 'Function(' + stringify('return this;') + ')()';
  }

  /**
   * Serialize the path to a string.
   *
   * @param  {Array}  path
   * @return {string}
   */
  function toPath (path) {
    var result = '';

    for (var i = 0; i < path.length; i++) {
      if (isValidVariableName(path[i])) {
        result += '.' + path[i];
      } else {
        result += '[' + stringify(path[i]) + ']';
      }
    }

    return result;
  }

  /**
   * Stringify an array of values.
   *
   * @param  {Array}    array
   * @param  {string}   indent
   * @param  {Function} next
   * @return {string}
   */
  function stringifyArray (array, indent, next) {
    // Map array values to their stringified values with correct indentation.
    var values = array.map(function (value, index) {
      var str = next(value, index);

      if (str === undefined) {
        return String(str);
      }

      return indent + str.split('\n').join('\n' + indent);
    }).join(indent ? ',\n' : ',');

    // Wrap the array in newlines if we have indentation set.
    if (indent && values) {
      return '[\n' + values + '\n]';
    }

    return '[' + values + ']';
  }

  /**
   * Stringify a map of values.
   *
   * @param  {Object}   object
   * @param  {string}   indent
   * @param  {Function} next
   * @return {string}
   */
  function stringifyObject (object, indent, next) {
    // Iterate over object keys and concat string together.
    var values = Object.keys(object).reduce(function (values, key) {
      var value = next(object[key], key);

      // Omit `undefined` object values.
      if (value === undefined) {
        return values;
      }

      // String format the key and value data.
      key   = isValidVariableName(key) ? key : stringify(key);
      value = String(value).split('\n').join('\n' + indent);

      // Push the current object key and value into the values array.
      values.push(indent + key + ':' + (indent ? ' ' : '') + value);

      return values;
    }, []).join(indent ? ',\n' : ',');

    // Wrap the object in newlines if we have indentation set.
    if (indent && values) {
      return '{\n' + values + '\n}';
    }

    return '{' + values + '}';
  }

  /**
   * Convert JavaScript objects into strings.
   */
  var OBJECT_TYPES = {
    '[object Array]': stringifyArray,
    '[object Object]': stringifyObject,
    '[object Error]': function (error) {
      return 'new Error(' + stringify(error.message) + ')';
    },
    '[object Date]': function (date) {
      return 'new Date(' + date.getTime() + ')';
    },
    '[object String]': function (string) {
      return 'new String(' + stringify(string.toString()) + ')';
    },
    '[object Number]': function (number) {
      return 'new Number(' + number + ')';
    },
    '[object Boolean]': function (boolean) {
      return 'new Boolean(' + boolean + ')';
    },
    '[object Uint8Array]': function (array, indent) {
      return 'new Uint8Array(' + stringifyArray(array) + ')';
    },
    '[object Set]': function (array, indent, next) {
      if (typeof Array.from === 'function') {
        return 'new Set(' + stringify(Array.from(array), indent, next) + ')';
      } else return undefined;
    },
    '[object Map]': function (array, indent, next) {
      if (typeof Array.from === 'function') {
        return 'new Map(' + stringify(Array.from(array), indent, next) + ')';
      } else return undefined;
    },
    '[object RegExp]': String,
    '[object Function]': String,
    '[object global]': toGlobalVariable,
    '[object Window]': toGlobalVariable
  };

  /**
   * Convert JavaScript primitives into strings.
   */
  var PRIMITIVE_TYPES = {
    'string': function (string) {
      return "'" + string.replace(ESCAPABLE, escapeChar) + "'";
    },
    'number': String,
    'object': String,
    'boolean': String,
    'symbol': String,
    'undefined': String
  };

  /**
   * Convert any value to a string.
   *
   * @param  {*}        value
   * @param  {string}   indent
   * @param  {Function} next
   * @return {string}
   */
  function stringify (value, indent, next) {
    // Convert primitives into strings.
    if (Object(value) !== value) {
      return PRIMITIVE_TYPES[typeof value](value, indent, next);
    }

    // Handle buffer objects before recursing (node < 6 was an object, node >= 6 is a `Uint8Array`).
    if (typeof Buffer === 'function' && Buffer.isBuffer(value)) {
      return 'new Buffer(' + next(value.toString()) + ')';
    }

    // Use the internal object string to select stringification method.
    var toString = OBJECT_TYPES[Object.prototype.toString.call(value)];

    // Convert objects into strings.
    return toString ? toString(value, indent, next) : undefined;
  }

  /**
   * Stringify an object into the literal string.
   *
   * @param  {*}               value
   * @param  {Function}        [replacer]
   * @param  {(number|string)} [space]
   * @param  {Object}          [options]
   * @return {string}
   */
  return function (value, replacer, space, options) {
    options = options || {}

    // Convert the spaces into a string.
    if (typeof space !== 'string') {
      space = new Array(Math.max(0, space|0) + 1).join(' ');
    }

    var maxDepth = Number(options.maxDepth) || 100;
    var references = !!options.references;
    var skipUndefinedProperties = !!options.skipUndefinedProperties;
    var valueCount = Number(options.maxValues) || 100000;

    var path = [];
    var stack = [];
    var encountered = [];
    var paths = [];
    var restore = [];

    /**
     * Stringify the next value in the stack.
     *
     * @param  {*}      value
     * @param  {string} key
     * @return {string}
     */
    function next (value, key) {
      if (skipUndefinedProperties && value === undefined) {
        return undefined;
      }

      path.push(key);
      var result = recurse(value, stringify);
      path.pop();
      return result;
    }

    /**
     * Handle recursion by checking if we've visited this node every iteration.
     *
     * @param  {*}        value
     * @param  {Function} stringify
     * @return {string}
     */
    var recurse = references ?
      function (value, stringify) {
        if (value && (typeof value === 'object' || typeof value === 'function')) {
          var seen = encountered.indexOf(value);

          // Track nodes to restore later.
          if (seen > -1) {
            restore.push(path.slice(), paths[seen]);
            return;
          }

          // Track encountered nodes.
          encountered.push(value);
          paths.push(path.slice());
        }

        // Stop when we hit the max depth.
        if (path.length > maxDepth || valueCount-- <= 0) {
          return;
        }

        // Stringify the value and fallback to
        return stringify(value, space, next);
      } :
      function (value, stringify) {
        var seen = stack.indexOf(value);

        if (seen > -1 || path.length > maxDepth || valueCount-- <= 0) {
          return;
        }

        stack.push(value);
        var value = stringify(value, space, next);
        stack.pop();
        return value;
      };

    // If the user defined a replacer function, make the recursion function
    // a double step process - `recurse -> replacer -> stringify`.
    if (typeof replacer === 'function') {
      var before = recurse

      // Intertwine the replacer function with the regular recursion.
      recurse = function (value, stringify) {
        return before(value, function (value, space, next) {
          return replacer(value, space, function (value) {
            return stringify(value, space, next);
          });
        });
      };
    }

    var result = recurse(value, stringify);

    // Attempt to restore circular references.
    if (restore.length) {
      var sep = space ? '\n' : '';
      var assignment = space ? ' = ' : '=';
      var eol = ';' + sep;
      var before = space ? '(function () {' : '(function(){'
      var after = '}())'
      var results = ['var x' + assignment + result];

      for (var i = 0; i < restore.length; i += 2) {
        results.push('x' + toPath(restore[i]) + assignment + 'x' + toPath(restore[i + 1]));
      }

      results.push('return x');

      return before + sep + results.join(eol) + eol + after
    }

    return result;
  };
});

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(12).Buffer))

/***/ }),
/* 27 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__;

/***/ })
/******/ ]);