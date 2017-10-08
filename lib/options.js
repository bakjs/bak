const { defaultsDeep } = require('lodash')
const RoutesPlugin = require('./plugins/routes')
const ShortcutsPlugin = require('./plugins/shortcuts')
const InputPlugin = require('./plugins/input')
const CompatPlugin = require('./plugins/compat')

const Options = module.exports = {}

Options.from = function (_options) {
  const options = defaultsDeep({}, _options, Options.defaults)

  // relativeTo
  if (!options.relativeTo) {
    options.relativeTo = process.cwd()
  }

  // Enable CORS on dev
  let routeOptions = options.routes
  if (options.dev && routeOptions.cors === undefined) {
    routeOptions.cors = { credentials: true }
  }

  // Route table plugin
  if (options.routeTable) {
    options.registrations.push([RoutesPlugin])
  }

  // Shortcuts plugin
  options.registrations.push([ShortcutsPlugin])

  // Input plugin
  options.registrations.push([InputPlugin])

  // Compat plugin
  options.registrations.unshift([CompatPlugin])

  return options
}

Options.defaults = {
  relativeTo: '',
  dev: process.env.NODE_ENV !== 'production',
  routeTable: process.env.NODE_ENV !== 'production',
  registrations: [],
  routes: [],
  prefix: '/',
  server: {
    cache: null,
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    routes: {
      cors: undefined
    }
  }
}
