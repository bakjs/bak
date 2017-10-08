const { realIP } = require('../utils')

exports.register = function (server, config) {
  server.ext('onPreHandler', (request, h) => {
    request.user = request.auth.credentials ? request.auth.credentials.user : null
    request.session = request.auth.artifacts
    request.ip = realIP(request)

    return h.continue
  })
}

exports.register.attributes = {
  name: 'bak-shortcuts'
}
