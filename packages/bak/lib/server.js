const Hapi = require('hapi')
const { resolve } = require('path')
const { serial, parallel } = require('items-promise')
const { normalizePath } = require('./utils')
const { camelCase } = require('lodash')
const DevErrors = require('hapi-dev-errors')
const RouteTablePlugin = require('@bakjs/route-table')
const ShortcutsPlugin = require('@bakjs/shortcuts')
const InputPlugin = require('@bakjs/input')
const LoggingPlugin = require('@bakjs/logging')

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
    if (this.options.keepAliveTimeout) {
      this.hapi.listener.keepAliveTimeout = this.options.keepAliveTimeout
    }

    // Register core plugins
    const corePlugins = [
      LoggingPlugin,
      ShortcutsPlugin,
      InputPlugin
    ]

    if (this.options.routeTable) {
      corePlugins.push(RouteTablePlugin)
    }

    if (this.options.devErrors) {
      corePlugins.push({
        plugin: DevErrors,
        options: this.options.devErrors
      })
    }

    await serial(corePlugins, this.register.bind(this))

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
      routes = this.bak.require(routes, true)
    }

    if (typeof routes === 'function') {
      dirty = true
      routes = new routes() // eslint-disable-line new-cap
      routes.server = this.hapi
    }

    if (typeof routes.init === 'function') {
      await Promise.resolve(routes.init())
    }

    if (typeof routes.routes === 'function') {
      dirty = true
      routes = await Promise.resolve(routes.routes())
    }

    if (!routes) {
      routes = []
    }

    if (!Array.isArray(routes)) {
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
      if (Array.isArray(route)) {
        return this._resolveRoutes(route, prefix)
      }

      // Prefixed nested routes
      if (route && route.prefix) {
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
     * @param registrationOptions
     * @returns {Promise}
     */
  register (registration, registrationOptions) {
    // Normalize registration into { plugin, [options], ... }
    if (!registration.plugin) {
      registration = {
        plugin: registration
      }
    }

    // Resolve plugin
    if (typeof registration.plugin === 'string') {
      let path = registration.plugin
      if (this.options.relativeTo && path[0] === '.') {
        path = resolve(this.options.relativeTo, path)
      }
      registration.plugin = this.bak.require(path)
    }

    // Resolve and merge configs for plugin
    const plugin = registration.plugin.plugin || registration.plugin
    const configKey = camelCase(plugin.configKey || plugin.name || (plugin.pkg && plugin.pkg.name) || '')

    if (configKey.length && this.options[configKey] && registration.options === undefined) {
      registration.options = this.options[configKey]
    }

    return this.hapi.register(registration, registrationOptions || {})
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
