const _ = require('lodash')
const { normalizePath, VALID_METHODS } = require('./utils')

class Controller {
  constructor () {
    this.prefix = ''
    this.defaults = {}
    this._routes = []
  }

  async init () {
    // STUB
  }

  get controllerName () {
    return this.constructor.name
  }

  async routes () {
    await this._ready
    return this._routes
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
    route.config = _.extend({
      id: this.controllerName + '.' + name
    }, this.defaults)

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
