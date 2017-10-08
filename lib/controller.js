const Boom = require('boom')
const _ = require('lodash')
const { trimSlash, normalizePath, is_valid_method, realIP } = require('./utils')

module.exports = class Controller {
  /**
     *
     * @param config
     */
  constructor (config) {
    // Keep config
    this.config = config || {}

    // Function binds
    this._internal_error = this._internal_error.bind(this)

    // Routes prefix
    this.config.prefix = trimSlash(this.config.prefix || '')

    // Default routes method
    if (!this.config.default_method) this.config.default_method = 'get'

    // Default config that applies all routes
    if (!this.config.default) this.config.default = {}

    // Routes specific config (overrides default_config)
    if (!this.config.routes) this.config.routes = {}

    // Models that can be injected to routes!
    if (!this.config.models) this.config.models = {}
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
      let _handler = this[prop]

      // Create safe handler that wraps function and injects route params
      route.handler = (request, reply) => {
        this._resolve_handler_params(request, reply, route_params).then((resolved_params) => {
          if (!resolved_params || reply._replied) return

          // Shortcuts
          request.user = request.auth.credentials ? request.auth.credentials.user : null
          request.session = request.auth.artifacts
          request.ip = realIP(request)

          return _handler.call(this, request, reply, resolved_params)
        })
      }

      // Push route
      routes.push(route)
    })

    return routes
  }

  _resolve_handler_params (request, reply, route_params) {
    let queue = []
    let resolved_params = {}

    route_params.forEach(({ param_id, is_optional }) => {
      let request_param = request.params[param_id]

      // Skip optional params if are not provided
      if (is_optional && !request_param) {
        resolved_params[param_id] = null
        return
      }

      // Find param's model
      let model = this.config.models[_.capitalize(param_id)]

      // Directly resolve params without model
      if (!model) {
        resolved_params[param_id] = request_param
        return
      }

      // Prepare query
      let routeKey = model.$routeKey || '_id'
      if (routeKey instanceof Function) routeKey = routeKey()
      let query = {}
      query[routeKey] = request_param.toString()

      // Push find job to queue
      queue.push(model.findOne(query).then((item) => {
        if (!item) {
          throw new Error('no records found for ' + param_id)
        }
        resolved_params[param_id] = item
      }))
    })

    return Promise.all(queue).then(() => {
      return resolved_params
    }).catch((err) => {
      if (!reply._replied) { reply(Boom.notFound(err.error)) }
      return null
    })
  }
}
