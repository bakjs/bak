const { parseRequest, commonFormat } = require('./utils')
const consola = require('consola')

exports.register = function (server, options) {
  const isDev = process.env.NODE_ENV !== 'production'

  server.events.on(
    { name: 'request', channels: ['error', 'internal'] }, (request, { error, timestamp }, tags) => {
      if (!error) {
        return
      }

      // Parse request
      const reqInfo = parseRequest(request, timestamp)

      if (isDev) {
        consola.error(error)
        consola.info(reqInfo)
      } else {
        // Log with common log format
        consola.log(commonFormat(reqInfo))
      }
    }
  )
}

exports.pkg = require('../package.json')
exports.once = true
exports.configKey = 'logging'
