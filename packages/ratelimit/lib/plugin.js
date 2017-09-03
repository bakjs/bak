const Boom = require('boom')
const Hoek = require('hoek')
const { Utils } = require('bak')

const { realIP } = Utils

function HapiRateLimit (plugin, _options, next) {
  // Apply default options
  const options = Hoek.applyToDefaults(defaults, _options)

  // Create limiter instance
  // const limiter = new RedisRateLimit(options);
  let Driver = options.driver
  if (typeof Driver === 'string') {
    Driver = require('./' + Driver)
  }
  const limiter = new Driver(options)

  const handleLimits = (request, reply) => {
    const route = request.route

    // Get route-specific limits
    let routeLimit = route.settings.plugins && route.settings.plugins.ratelimit

    // Try to apply global if no options
    if (options.global) {
      routeLimit = Object.assign({}, options.global, routeLimit)
    }

    // If no limits on route
    if (!routeLimit) {
      return reply.continue()
    }

    // Check limits on route
    Promise.resolve(limiter.check(
      options.namespace + ':' + realIP(request) + ':' + (request.route.id || request.route.path),
      routeLimit.limit,
      routeLimit.duration
    )).then(rateLimit => {
      request.plugins.ratelimit = {
        limit: rateLimit.limit,
        remaining: rateLimit.remaining - 1,
        reset: rateLimit.reset
      }

      if (rateLimit.remaining > 0) {
        return reply.continue()
      }

      const error = Boom.tooManyRequests('RATE_LIMIT_EXCEEDED')
      setHeaders(error.output.headers, request.plugins.ratelimit, options.XHeaders)
      error.reformat()

      return reply(error)
    }).catch(reply)
  }

  const responseLimits = (request, reply) => {
    if (request.plugins.ratelimit) {
      const response = request.response
      if (!response.isBoom) {
        setHeaders(response.headers, request.plugins.ratelimit, options.XHeaders)
      }
    }
    reply.continue()
  }

  // Ext
  plugin.ext('onPreAuth', handleLimits)
  plugin.ext('onPostHandler', responseLimits)

  next()
}

// Set rate-limit headers
function setHeaders (headers, ratelimit, XHeaders = false) {
  if (XHeaders) {
    headers['X-Rate-Limit-Limit'] = ratelimit.limit
    headers['X-Rate-Limit-Remaining'] = ratelimit.remaining > 0 ? ratelimit.remaining : 0
    headers['X-Rate-Limit-Reset'] = ratelimit.reset
  }

  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After
  headers['Retry-After'] = Math.ceil(ratelimit.reset / 1000)
}

// Default options
const defaults = {
  namespace: 'ratelimit',
  driver: 'memory',
  XHeaders: false,
  global: {
    limit: 60,
    duration: 60000
  }
}

// Meta
HapiRateLimit.attributes = {
  pkg: {
    name: 'bak-ratelimit'
  }
}

// Export plugin
exports.register = HapiRateLimit
