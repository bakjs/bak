const config = require('config')
const Hapi = require('hapi')
const { resolve } = require('path')
const { serial, parallel } = require('items-promise')
const { normalizePath } = require('./utils')

module.exports = class Server {
  /**
     *
     * @param bak
     */
  constructor (bak) {
    this.bak = bak
    this.options = this.bak.options
  }

  /**
     *
     * @returns {Promise.<Server>}
     */
  async init () {
    // Create server
    this.hapi = new Hapi.Server(this.options.server)

    // Register plugins
    await serial(this.options.registrations, this.register.bind(this))

    // Register routes
    await this.registerRoutes(this.options.routes)

    return this
  }

  /**
     * Start server
     * @returns {Promise}
     * @private
     */
  async start () {
    await this.hapi.initialize()
    await this.hapi.start()
    return this
  }

  /**
     *
     * @param routes
     * @returns {Promise}
     * @private
     */
  async _loadRoutes (routes, dirty = false) {
    if (typeof routes === 'string') {
      dirty = true
      routes = require(resolve(this.options.relativeTo, routes))
    }

    if (routes instanceof Function) {
      dirty = true
      routes = new routes() // eslint-disable-line new-cap
      routes.server = this
      routes.hapi = this.hapi
    }

    if (routes.routes instanceof Function) {
      dirty = true
      routes = await routes.routes(this.bak)
    }

    if (!routes) {
      routes = []
    }

    if (!(routes instanceof Array)) {
      routes = [routes]
    }

    if (dirty) {
      routes = await parallel(routes, this._loadRoutes.bind(this))
      routes = Array.prototype.concat.apply([], routes)
    }

    return routes
  }

  /**
     *
     * @param routes
     * @param prefix
     * @returns {Promise<Array>}
     * @private
     */
  async _resolveRoutes (routes, prefix = '') {
    routes = await this._loadRoutes(routes, true)
    prefix = ((prefix && prefix.length) ? prefix : '') + '/'

    return Array.prototype.concat.apply([], await parallel(routes, async route => {
      // Simple nested routes
      if (route instanceof Array) {
        return this._resolveRoutes(route, prefix)
      }

      // Prefixed nested routes
      if (route instanceof Object && route.prefix) {
        const nestedPrefix = prefix + route.prefix
        return this._resolveRoutes(route.routes, nestedPrefix)
      }

      // Same level routes
      if (prefix.length) {
        route.path = normalizePath(prefix + (route.path || ''))
      }
      if (!route.path || !route.path.length) {
        route.path = '/'
      }
      if (!route.method) {
        route.method = 'GET'
      }

      return route
    }))
  }

  /**
     *
     * @param routes
     * @returns {Promise}
     */
  async registerRoutes (routes) {
    // Resolve
    routes = await this._resolveRoutes(routes, this.options.prefix)

    // Register
    return this.hapi.route(routes)
  }

  /**
     *
     * @param registration
     * @returns {Promise}
     */
  register (registration) {
    let plugin = registration.plugin || registration
    let options = (registration.plugin && registration.options) ? registration.options : {}

    if (Array.isArray(plugin)) {
      plugin = {
        register: plugin[0],
        options: plugin[1]
      }
    }

    if (typeof plugin === 'string') {
      plugin = { register: plugin }
    }

    if (typeof plugin.register === 'string') {
      let path = plugin.register
      if (this.options.relativeTo && path[0] === '.') {
        path = resolve(this.options.relativeTo, path)
      }
      plugin.register = require(path)

      // Supports modules exporting plugin as default
      if (plugin.register.default) {
        plugin.register = plugin.register.default
      }
    }

    // Plugin options
    if (!plugin.options) {
      plugin.options = {}
    }

    // Add $bak to options
    plugin.options.$bak = this.bak

    // Auto config
    const attrs = plugin.register.register.attributes
    const configKey = (attrs.configKey || attrs.name || '').replace('bak-', '')
    if (configKey.length) {
      if (this.options[configKey]) {
        Object.assign(plugin.options, this.options[configKey])
      }
      if (config.has(configKey)) {
        Object.assign(plugin.options, config.get(configKey))
      }
    }

    return this.hapi.register(plugin, options)
  }

  /**
   * Log error to hapi
   * @param {*} error 
   * @param {*} request 
   */
  logError (error, request = {}) {
    // Ignore Boom or null exceptions
    if (!error || error.isBoom) {
      return
    }

    const tags = [
      'error'
    ]

    const context = {
      error,
      payload: request.payload,
      query: request.query,
      user: request.auth.credentials
    }

    this.hapi.log(tags, context)
  }
}
