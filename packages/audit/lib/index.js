const Audit = require('./audit')

exports.register = function (server, config) {
  server.decorate('request', 'audit', function audit (action, resource, opts) {
    // Clone object
    const audit = Object.assign({}, opts || {})

    // Action
    audit.action = action

    // Resource & Kind
    if (resource) {
      audit.resource = resource._id || resource

      if (!audit.kind && resource.constructor && resource.constructor.modelName) {
        audit.kind = resource.constructor.modelName
      }
    }

    // User
    if (!audit.user && this.auth.credentials && this.auth.credentials.user) {
      audit.user = this.auth.credentials.user._id || this.auth.credentials.user
    }

    // IP
    if (!audit.ip) {
      audit.ip = this.ip
    }

    // Tags
    audit.tags = ['audit'].concat(audit.tags || [])

    // Emit log event
    this.log(audit.tags, audit)

    // Store in DB
    return new Audit(audit).save()
  })
}

exports.pkg = require('../package.json')
exports.once = true
exports.configKey = 'audit'

exports.Audit = Audit
