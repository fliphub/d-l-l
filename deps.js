const log = require('fliplog')
const fliptime = require('fliptime')

// time diffs, caching
const {tillNow, tillNowSatisfies} = fliptime

// simple unique array filter fn
function uniq(value, index, arr) {
  return arr.indexOf(value) === index
}

/**
 * @param  {Object} ago
 * @return {GlobFile}
 */
function lastModified(ago) {
  const cb = mtime => tillNowSatisfies(mtime, ago)
  return ({mtime}) => {
    if (cb(mtime)) return false
    return true
  }
}

/**
 * @param  {Array<Array | any>} arr
 * @return {Array<any>}
 */
function flatten(arr) {
  const flat = [].concat(...arr)
  return flat.some(Array.isArray) ? flatten(flat) : flat
}

module.exports = {
  tillNow,
  tillNowSatisfies,
  uniq,
  lastModified,
  flatten,
  log,
}
