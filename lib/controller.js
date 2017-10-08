const Boom = require('boom')
const _ = require('lodash')
const { trimSlash, normalizePath, is_valid_method } = require('./utils')

module.exports = class Controller {
  /**
     *
     * @param config
     */
  constructor (config) {
    // Keep config
    this.config = config || {}

    // Routes prefix
    this.config.prefix = trimSlash(this.config.prefix || '')

    // Default routes method
    if (!this.config.default_method) this.config.default_method = 'get'

    // Default config that applies all routes
    if (!this.config.default) this.config.default = {}

    // Routes specific config (overrides default_config)
    if (!this.config.routes) this.config.routes = {}
  }

  // ==================================================
  // Routing
  // ==================================================

  /**
     * Returns prefixed controller routes compatible with HAPI api
     * @returns {Array}
     */
  routes () {
    let routes = []

    Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach((prop) => {
      // Skip internal functions
      if (prop === 'constructor' ||
                (prop.indexOf('_') === 0 && !(prop === '_' || is_valid_method(prop.substring(1))))
      ) {
        return
      }

      // Make route object
      let route = {}

      // Route config
      route.config = _.extend({
        id: this.constructor.name + '.' + prop
      }, this.config.default, this.config.routes[prop])

      // Skip disabled routes
      if (route.config.enabled === false) {
        return
      }

      // 'enabled' is a non-standard hapi config and should be omitted
      delete route.config.enabled

      // Generate path and method based on prop name
      let split = prop.split('_')

      // Route method
      route.method = this.config.default_method
      if (is_valid_method(split[split.length - 1])) { route.method = split.pop() }

      // Any method
      if (route.method === 'any') {
        route.method = '*'
      }

      // Prepend prefix to split
      if (this.config.prefix && this.config.prefix.length) {
        split = this.config.prefix.split('/').concat(split)
      }

      // Convert route parameters from $param to {param} syntax
      let route_params = []
      split = split.map((s) => {
        if (s.indexOf('$') === 0) {
          let is_optional = (s.indexOf('$$') === 0)
          let param = s.substr(is_optional ? 2 : 1)
          s = '{' + param + (is_optional ? '?' : '') + '}'
          route_params.push({ param_id: param, is_optional })
          return s
        }
        return _.snakeCase(s)
      })

      // Route path
      route.path = normalizePath('/' + split.join('/'))

      // Route handler
      route.handler = this[prop]

      // Push route
      routes.push(route)
    })

    return routes
  }
}
