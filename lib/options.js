const { defaultsDeep } = require('lodash')

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
