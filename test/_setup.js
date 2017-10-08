jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000
process.env.SUPPRESS_NO_CONFIG_WARNING = true

const axios = require('axios')
const { Bak } = require('..')

function setup (name) {
  // Load bak.config.js for fixture
  const config = require(`./fixtures/${name}/bak.config`)

  // Create new Bak instance
  this.bak = new Bak(config)

  // Helpers
  this.url = path => `http://localhost:${config.server.port}${path}`
  this.get = (url, ...args) => axios.get(this.url(url), ...args).then(r => r.data)

  beforeAll(async () => {
    await this.bak.init()
  })

  afterAll(async () => {
    await this.bak.server.hapi.stop()
  })
}

module.exports = setup
