exports.register = function bakShortcuts (server, config) {
  server.ext('onPreHandler', (request, h) => {
    request.user = request.auth.credentials ? request.auth.credentials.user : null
    request.session = request.auth.artifacts
    request.ip = realIP(request)

    return h.continue
  })
}

exports.pkg = require('../package.json')
exports.once = true
exports.configKey = 'shortcuts'

function realIP (request) {
  return request.ip || request.headers['x-real-ip'] || request.headers['x-forwarded-for'] || request.info['remoteAddress']
}
