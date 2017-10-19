const config = require('config')
const Hapi = require('hapi')
const { resolve } = require('path')
const { serial, parallel } = require('items-promise')
const { normalizePath } = require('./utils')

const RouteTablePlugin = require('@bakjs/route-table')
const ShortcutsPlugin = require('@bakjs/shortcuts')
const InputPlugin = require('@bakjs/input')
const CompatPlugin = require('@bakjs/compat')

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

    // Register core plugins
    const corePlugins = [
      {
        plugin: CompatPlugin,
        options: {
          server: this.hapi
        }
      },
      ShortcutsPlugin,
      InputPlugin
    ]

    if (this.options.routeTable) {
      corePlugins.push(RouteTablePlugin)
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

    if (!registration.options) {
      registration.options = {}
    }

    // Resolve plugin
    if (typeof registration.plugin === 'string') {
      let path = registration.plugin
      if (this.options.relativeTo && path[0] === '.') {
        path = resolve(this.options.relativeTo, path)
      }
      registration.plugin = require(path)
    }

    // Resolve and merge configs for plugin
    const configKey = (registration.plugin.configKey || registration.plugin.name || (registration.plugin.pkg && registration.plugin.pkg.name) || '')
      .replace('@bakjs/', '')
      .replace('bak-', '')

    if (configKey.length) {
      // 1. from bak.config.js
      if (this.options[configKey]) {
        Object.assign(registration.options, this.options[configKey])
      }
      // 2. From config/
      if (config.has(configKey)) {
        Object.assign(registration.options, config.get(configKey))
      }
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
