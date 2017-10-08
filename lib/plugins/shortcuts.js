const { realIP } = require('../utils')

exports.register = function (server, config, next) {
  server.ext('onPreHandler', (request, reply) => {
    request.user = request.auth.credentials ? request.auth.credentials.user : null
    request.session = request.auth.artifacts
    request.ip = realIP(request)

    return reply.continue()
  })

  next()
}

exports.register.attributes = {
  name: 'bak-shortcuts'
}
