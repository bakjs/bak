const esm = require('esm')
const path = require('path')

const Options = require('./options')
const Server = require('./server')

module.exports = class Bak {
  constructor (_options) {
    this.options = Options.from(_options)

    this._requireESM = esm(module, this.options.esm)

    this.server = new Server(this)
  }

  require (modulePath, relative = false) {
    if (relative) {
      modulePath = path.resolve(this.options.relativeTo, modulePath)
    }

    const m = this._requireESM(modulePath)

    return m.default || m
  }

  async init () {
    await this.server.init()
    await this.server.start()
  }
}
