const path = require('path')
const chalk = require('chalk')
const consola = require('consola')

module.exports = {
  flags: 'start [dir]',
  desc: 'Start Server',
  paramsDesc: 'Root directory of app, containing config file',
  async run (argv) {
    const rootDir = path.resolve(process.cwd(), argv.dir || '')
    const configPath = path.resolve(rootDir, argv.config)
    const config = require(configPath)

    // Root Dir
    if (!config.relativeTo) {
      config.relativeTo = rootDir
    }

    // Delay loading framework until command is actually run
    const { Bak } = require('../..')

    // Create server instance
    const bak = new Bak(config)

    // Start server
    await bak.init()

    consola.log('\n' + chalk.bgGreen.black(' OPEN ') + ' ' + chalk.green(bak.server.hapi.info.uri))
  }
}
