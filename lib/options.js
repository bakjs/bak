const { defaultsDeep } = require('lodash')
const RoutesPlugin = require('./plugins/routes')
const ShortcutsPlugin = require('./plugins/shortcuts')
const InputPlugin = require('./plugins/input')

const Options = module.exports = {}

Options.from = function (_options) {
  const options = defaultsDeep({}, _options, Options.defaults)

  // relativeTo
  if (!options.relativeTo) {
    options.relativeTo = process.cwd()
  }

  // Add default connection to connections[] if specified
  if (options.connection) {
    options.connections.push(options.connection)
  }

  // Enable CORS on dev
  let routeOptions = options.connection.routes
  if (options.dev && routeOptions.cors === undefined) {
    routeOptions.cors = { credentials: true }
  }

  // Route table plugin
  if (options.routeTable) {
    options.registrations.push(RoutesPlugin)
  }

  // Shortcuts plugin
  options.registrations.push(ShortcutsPlugin)

  // Input plugin
  options.registrations.push(InputPlugin)

  return options
}

// Should be compatible to Glue manifest https://github.com/hapijs/glue/blob/master/API.md
Options.defaults = {
  relativeTo: '',
  dev: process.env.NODE_ENV !== 'production',
  routeTable: process.env.NODE_ENV !== 'production',
  registrations: [],
  prefix: '/',
  routes: [],
  preConnections: null,
  preRegister: null,
  server: {
    cache: null
  },
  connections: [],
  connection: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    routes: {
      cors: undefined
    }
  }
}
