const Options = require('./options')
const Server = require('./server')

module.exports = class Bak {
    constructor(_options) {
        this.options = Options.from(_options)

        this.server = new Server(this)
    }

    async init() {
        await this.server.init()
        await this.server.start()
    }
}