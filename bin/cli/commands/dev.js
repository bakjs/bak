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
      args: [
        'start',
        rootDir
      ],
      nodeArgs: extraArgs
    }, config.nodemon)

    // https://github.com/remy/nodemon/blob/master/doc/events.md
    nodemon.on('start', () => {
      consola.start({
        message: 'Starting server...',
        additional: 'Working directory: ' + rootDir
      })
    })

    nodemon.on('crash', () => {
      consola.error({
        type: 'Crash',
        message: 'Server has crashed!',
        additional: 'Fix code or use `rs` command to restart server immediately.'
      })
    })

    nodemon.on('quit', () => {
      consola.success({
        type: 'bye',
        message: 'Server gracefully stopped'
      })
      process.exit(0)
    })

    nodemon.on('restart', (files = []) => {
      consola.info({
        type: 'Reload',
        message: files.length ? 'Reloading server due to file changes' : 'Restarting server',
        additional: files.join('\n')
      })
    })

    nodemon(nodemonConfig)
  }
}
