const Boom = require('boom')
const Hoek = require('hoek')
const Joi = require('joi')

// Based on https://github.com/johnbrett/hapi-auth-bearer-token (MIT)

const defaults = {
  accessTokenName: 'token',
  allowQueryToken: true,
  allowCookieToken: true,
  tokenType: 'Bearer'
}

const schema = Joi.object().keys({
  accessTokenName: Joi.string().required(),
  allowQueryToken: Joi.boolean(),
  allowCookieToken: Joi.boolean(),
  tokenType: Joi.string().required()
}).unknown(true)

const plugin = (server, {authOptions, authProvider}) => {
  Hoek.assert(authOptions, 'Missing authOptions')
  Hoek.assert(authProvider, 'Missing authProvider')

  const settings = Hoek.applyToDefaults(defaults, authOptions)

  Joi.assert(settings, schema)

  const authenticate = (request, reply) => {
    try {
      // Use headers by default
      let authorization = request.raw.req.headers.authorization

      // Fallback 1 : Check for cookies
      if (settings.allowCookieToken &&
                !authorization &&
                request.state[settings.accessTokenName]) {
        authorization = settings.tokenType + ' ' + request.state[settings.accessTokenName]
      }

      // Fallback 2 : URL Query
      if (settings.allowQueryToken &&
                !authorization &&
                request.query[settings.accessTokenName]) {
        authorization = settings.tokenType + ' ' + request.query[settings.accessTokenName]
        delete request.query[settings.accessTokenName]
      }

      // Fallback 3 : Throw Error
      if (!authorization) {
        return reply(Boom.unauthorized(null, settings.tokenType))
      }

      // Try to parse headers
      const parts = authorization.split(/\s+/)

      // Ensure correct token type
      if (parts[0].toLowerCase() !== settings.tokenType.toLowerCase()) {
        return reply(Boom.unauthorized(null, settings.tokenType))
      }

      // Validate token
      const token = parts[1]

      authProvider.authToken(token).then(({credentials, artifacts}) => {
        reply.continue({credentials, artifacts})
      }).catch(err => {
        reply(Boom.unauthorized(err.error))
      })
    } catch (e) {
      reply(Boom.internal('AUTH_ERROR'))
    }
  }

  return {authenticate}
}

module.exports = plugin
