const { realIP } = require('./utils')

const RouteShortcuts = {
  register (server, config) {
    server.ext('onPreHandler', (request, reply) => {
      request.user = request.auth.credentials ? request.auth.credentials.user : null
      request.session = request.auth.artifacts
      request.ip = realIP(request)
    })
  }
}

RouteShortcuts.register.attributes = {
  name: 'bak-route-shortcuts'
}

module.exports = RouteShortcuts
