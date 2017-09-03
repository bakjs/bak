const { resolve } = require('path')
const chalk = require('chalk')
const os = require('os')
const { Bak } = require('../..')

module.exports = {
    flags: 'start [dir]',
    desc: 'Start Server',
    setup(cli) {

    },
    async run(argv) {
        const rootDir = resolve(process.cwd(), argv.dir || '')
        const configPath = resolve(rootDir, argv.config || 'bak.config.js')
        const config = require(configPath)

        // Root Dir
        if (!config.relativeTo) {
            config.relativeTo = rootDir
        }

        // Create server instance
        const bak = new Bak(config)

        // Start server
        await bak.init()

        console.log('\n' + chalk.bgGreen.black(' OPEN ') + ' ' + chalk.green(bak.server.hapi.info.uri).replace('0.0.0.0', os.hostname()))
    }
}