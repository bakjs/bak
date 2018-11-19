const Redis = require('redis')
const Limiter = require('ratelimiter')

class RedisRateLimit {
  constructor (options = {redis: {}}) {
    this.options = options

    this.redisClient = Redis.createClient(
      options.redis.port,
      options.redis.host,
      options.redis.options
    )
  }

  check (id, limit, duration) {
    const routeLimiter = new Limiter({id, max: limit, duration})

    return new Promise((resolve, reject) => {
      routeLimiter.get((err, rateLimit) => {
        if (err) {
          return reject(err)
        }
        resolve({
          limit: rateLimit.total,
          remaining: rateLimit.remaining,
          reset: rateLimit.reset
        })
      })
    })
  }
}

module.exports = RedisRateLimit
