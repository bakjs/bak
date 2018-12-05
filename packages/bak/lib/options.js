const env = require('std-env')
const { defaultsDeep } = require('lodash')
const consola = require('consola')

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

  // routeTable
  if (options.routeTable === undefined) {
    options.routeTable = options.dev
  }

  // Errors
  if (options.devErrors) {
    if (options.devErrors.showErrors === undefined) {
      options.devErrors.showErrors = options.dev
    }
  }

  // Validation errors
  const { validate } = options.server.routes
  if (validate.failAction === undefined) {
    validate.failAction = async (_, __, err) => {
      if (options.dev) {
        consola.error(err + '')
      }
      throw err
    }
  }

  return options
}

Options.defaults = {
  dev: !env.production && !env.test && !env.ci,
  relativeTo: '',
  routeTable: undefined,
  registrations: [],
  routes: [],
  esm: {},
  prefix: '/',
  nodemon: {},
  devErrors: {
    showErrors: undefined,
    useYouch: true,
    toTerminal: false
  },
  server: {
    cache: null,
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    router: {
      stripTrailingSlash: true
    },
    routes: {
      cors: undefined,
      validate: {
        failAction: undefined
      }
    }
  },
  listener: {
    keepAliveTimeout: undefined
  }
}
