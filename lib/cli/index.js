const cli = require('sywac')
const styles = require('./styles')
const consola = require('consola')

// Console error unhandled promises
process.on('unhandledRejection', err => {
  consola.error(err)
})

// Hide config package warns
process.env.SUPPRESS_NO_CONFIG_WARNING = true

// Commands
cli.commandDirectory('commands')

// Global options
cli.file('-c, --config <file>', {
  desc: 'Config file',
  defaultValue: 'bak.config.js'
})

// Help text stuff
cli.style(styles)
cli.help('-h, --help')
cli.version('-v, --version')
cli.showHelpByDefault()
cli.outputSettings({ maxWidth: 75 })

// Export cli config
// Call parseAndExit() in bin/bak
// Or call parse(args) in tests
module.exports = cli
