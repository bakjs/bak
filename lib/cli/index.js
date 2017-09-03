require('./errors')
const cli = require('sywac')
const styles = require('./styles')

// Commands
cli.command(require('./commands/start'))

// Help text stuff
cli.style(styles)
cli.help('-h, --help')
cli.version('-v, --version')
cli.showHelpByDefault()

// Global options
cli.file('-c, --config', {
  mustExist: true,
  desc: 'Config file'
})

// Run CLI
cli.parseAndExit()
// .then(console.log)
  .catch(console.error)
