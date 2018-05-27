const chalk = require('chalk')
const consola = require('consola')
const { parseArgs } = require('../utils')

module.exports = {
  flags: 'start [dir]',
  desc: 'Start server',
  paramsDesc: 'Root directory of app, containing bak.config.js config file',
  async run (argv) {
    const { config } = parseArgs(argv)

    // Delay loading framework until command is actually run
    const { Bak } = require('../../..')

    // Create server instance
    const bak = new Bak(config)

    // Start server
    await bak.init()

    consola.ready({
      message: `Listening on ${chalk.blue.underline(bak.server.hapi.info.uri)}`,
      badge: true
    })
  }
}
