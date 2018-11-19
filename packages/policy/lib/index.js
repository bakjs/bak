const GuardPlugin = require('./guard-plugin')
const AuthorizePlugin = require('./authorize-plugin')

exports.register = function (server, options) {
  if (!options) options = {}

  server.register({ plugin: GuardPlugin, options })

  server.register({ plugin: AuthorizePlugin, options })
}

exports.pkg = require('../package.json')
exports.once = true
exports.configKey = 'policy'
