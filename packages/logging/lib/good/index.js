const Good = require('good')
const GoodInflux = require('good-influx')
const GoodConsole = require('good-console')
const GoodSentry = require('./good-sentry')
const GoodAudit = require('../audit/good-audit')

const GoodPlugin = {
  register (server, config, next) {
    const reporters = {}

    // Default squeeze filter
    const squeeze = {
      module: 'good-squeeze',
      name: 'Squeeze',
      args: [{ log: '*', request: '*' }]
    }

    // Sentry reporter
    if (config.sentry && config.sentry.dsn) {
      reporters.sentry = [
        squeeze,
        {
          module: GoodSentry,
          args: [{
            server,
            dsn: config.sentry.dsn,
            config: config.sentry
          }]
        }
      ]
    }

    // Influx reporter
    // @see https://github.com/fhemberger/good-influx
    if (config.influx && config.influx.endpoint) {
      reporters.sentry = [
        Object.assign({}, squeeze, { args: [{ ops: '*' }] }), // Send only 'ops' events to InfluxDB
        {
          module: GoodInflux,
          args: [config.influx.endpoint, config.influx]
        }
      ]
    }

    // Audit Reporter
    if (config.audit) {
      reporters.audit = [
        squeeze,
        {
          module: GoodAudit,
          args: [{
            server,
            config: config.audit
          }]
        }
      ]
    }

    // Console reporter
    reporters.console = [
      squeeze,
      { module: GoodConsole },
      'stdout'
    ]

    server.register({
      register: Good,
      options: Object.assign({}, config.options, { reporters })
    }, (err) => {
      if (err) console.error(err)
      if (next) next()
    })
  }
}

GoodPlugin.register.attributes = {
  name: 'bak-good'
}

module.exports = GoodPlugin
