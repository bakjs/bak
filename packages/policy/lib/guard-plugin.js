const Boom = require('@hapi/boom')

exports.register = function (server, options) {
  if (!options) options = {}

  server.ext('onPreHandler', async (request, h) => {
    const route_guards = request.route.settings.plugins.guards
    if (!route_guards) return h.continue

    try {
      for (let i = 0; i < route_guards.length; i++) {
        if (!(await request.can(route_guards[i]))) {
          throw Boom.unauthorized(route_guards[i].name || route_guards[i])
        }
      }
    } catch (error) {
      // Log and reject unhandled errors
      server.log(['error', 'authorize', 'guard'], { error })
      throw Boom.unauthorized()
    }

    return h.continue
  })
}

exports.pkg = require('../package.json')
exports.name = '@bakjs/policy/guard'
exports.once = true
