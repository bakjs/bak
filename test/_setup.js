jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000
process.env.SUPPRESS_NO_CONFIG_WARNING = true

const axios = require('axios')
const { Bak } = require('bak')

function setup (name) {
  // Load bak.config.js for fixture
  const config = require(`./fixtures/${name}/bak.config`)

  // Create new Bak instance
  this.bak = new Bak(config)

  // Helpers
  this.url = path => `http://localhost:${config.server.port}${path}`
  this.get = (url, ...args) => axios.get(this.url(url), ...args).then(r => r.data)

  this.init = () => test('init server', async () => {
    await this.bak.init()
  })

  this.stop = () => test('stop server', async () => {
    await this.bak.server.hapi.stop()
  })
}

module.exports = setup
