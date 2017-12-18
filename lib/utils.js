function trimSlash (s) {
  return s[s.length - 1] === '/' ? s.slice(0, s.length - 1) : s
}

function normalizePath (path) {
  return trimSlash(path.replace(/\/+/g, '/'))
}

function fatal (msg, error, additional) {
  console.error(additional + '\r\n', msg, error)
  process.exit(1)
}

const VALID_METHODS = ['get', 'post', 'put', 'delete', 'patch', '*', 'any']
function is_valid_method (method) {
  if (!method) return false
  if (method instanceof Array) {
    for (let i = 0; i < method.length; i++) {
      if (!is_valid_method(method[i])) { return false }
    }
  } else {
    if (VALID_METHODS.indexOf(method.toLowerCase()) === -1) { return false }
  }
  return true
}

/**
 *
 * @param func {Function}
 * @returns {Array}
 */
function getParamNames (func) {
  let func_str = func.toString()
  let func_def = func_str.slice(func_str.indexOf('(') + 1, func_str.indexOf(')'))
  return func_def.match(/([^\s,]+)/g)
}

/**
 * Try to detect request real ip
 * @param request
 * @returns string
 */
function realIP (request) {
  return request.ip || request.headers['x-real-ip'] || request.headers['x-forwarded-for'] || request.info['remoteAddress']
}

// Exports
module.exports = {
  trimSlash,
  normalizePath,
  fatal,
  is_valid_method,
  getParamNames,
  realIP,
  VALID_METHODS
}
