const { defaultsDeep } = require('lodash')
const { normalizePath, VALID_METHODS } = require('./utils')

class Controller {
  constructor () {
    this.prefix = ''
    this.defaults = {}
    this._routes = []
  }

  async routes () {
    return this._routes
  }

  async init () {
    // STUB
  }

  get controllerName () {
    return this.constructor.name
  }

  route (method, path, handler, config) {
    this._route({
      method,
      path,
      handler,
      config
    })
  }

  _route (route) {
    // -- Method --
    // any ~> *
    if (route.method === 'any') {
      route.method = '*'
    }

    // Convert to upper case for consistency
    route.method = route.method.toUpperCase()

    // -- Path --
    // Prepend prefix to path
    if (this.prefix && this.prefix.length) {
      route.path = normalizePath(this.prefix + route.path)
    }

    // -- Handler --
    // Bind route handler to this
    route.handler = route.handler.bind(this)

    // -- Config --
    // Compute route name
    const name = route.handler.name.replace('bound ', '')

    // Extend route config by defaults
    route.config = defaultsDeep({
      id: this.controllerName + '.' + name
    }, route.config, this.defaults)

    // Remove payload validation for GET and HEAD requests
    if (route.method === 'GET' || route.method === 'HEAD') {
      if (route.config.validate) {
        delete route.config.validate.payload
      }
    }

    // Add to _routes
    this._routes.push(route)
  }
}

// Append route helpers to Controller prototype
VALID_METHODS.forEach(method => {
  const fn = function () {
    this.route(method, ...arguments)
  }
  fn.name = method
  Controller.prototype[method] = fn
})

module.exports = Controller
