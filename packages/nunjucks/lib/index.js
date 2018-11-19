const Vision = require('vision')
const path = require('path')
const Inert = require('inert')
const NunjuksEngine = require('./nunjucks-engine')

exports.register = (server, options) => {
  const baseDir = options.baseDir || 'resources'

  server.register(Vision, () => {
    server.root.views({
      engines: Object.assign({
        njk: NunjuksEngine,
        jinja2: NunjuksEngine
      }, options.engines),
      isCached: process.env.NODE_ENV === 'production',
      path: options.viewsDir || path.join(baseDir, 'views'),
      defaultExtension: options.defaultExtension || 'njk'
    })
  })

  if (options.serveStatic !== false) {
    server.register({ register: Inert }, () => {
      server.route({
        method: 'GET',
        path: `${options.staticRoute || '/static'}/{param*}`,
        config: {
          auth: false,
          cache: {
            expiresIn: options.staticCache || 30 * 60 * 1000
          }
        },
        handler: {
          directory: {
            path: options.staticDir || path.join(baseDir, 'static')
          }
        }
      })
    })
  }
}

exports.pkg = require('../package.json')
exports.once = true
exports.configKey = 'nunjucks'
