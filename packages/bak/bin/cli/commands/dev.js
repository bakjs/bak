const path = require('path')
const consola = require('consola')

const { parseArgs } = require('../utils')

module.exports = {
  flags: 'dev [dir]',
  desc: 'Start development server with auto-reload',
  paramsDesc: 'Root directory of app, containing bak.config.js config file',
  async run (argv) {
    const { rootDir, config, extraArgs } = parseArgs(argv)

    const nodemon = require('nodemon')

    // https://github.com/remy/nodemon/blob/master/doc/requireable.md
    const nodemonConfig = Object.assign({
      cwd: rootDir,
      script: path.resolve(__dirname, '../../bak'),
      restartable: 'rs',
      args: [
        'start',
        rootDir
      ],
      nodeArgs: extraArgs
    }, config.nodemon)

    // Start nodemon before listening for events
    nodemon(nodemonConfig)

    // https://github.com/remy/nodemon/blob/master/doc/events.md
    nodemon.on('start', () => {
      consola.info('Starting server...')
      consola.info('Working directory: ' + rootDir)
    })

    nodemon.on('crash', () => {
      consola.fatal('Server has crashed!')
      consola.info('Fix code or use `rs` command to restart server immediately.')
    })

    nodemon.on('quit', () => {
      consola.info('Server gracefully stopped!')
      process.exit(0)
    })

    nodemon.on('restart', (files = []) => {
      if (files.length) {
        consola.info('Reloading server due to file changes...')
      } else {
        consola.info('Restarting server...')
      }
    })
  }
}
