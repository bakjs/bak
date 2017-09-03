const Boom = require('boom')

exports.register = function (server, options, next) {
  if (!options) options = {}

  server.ext('onPreHandler', async (request, reply) => {
    const route_guards = request.route.settings.plugins.guards
    if (!route_guards) return reply.continue()

    try {
      for (let i = 0; i < route_guards.length; i++) {
        if (!(await request.can(route_guards[i]))) { return reply(Boom.unauthorized(route_guards[i].name || route_guards[i])) }
      }
    } catch (error) {
      // Log and reject unhandled errors
      server.log(['error', 'authorize', 'guard'], { error })
      return reply(Boom.unauthorized())
    }

    return reply.continue()
  })

  next()
}

exports.register.attributes = {
  name: 'bak-policy-guard',
  dependencies: ['bak-policy-authorize']
}
