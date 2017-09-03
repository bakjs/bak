const hoek = require('hoek')
const Stream = require('stream')
const Raven = require('raven')
const git = require('git-rev')
const _ = require('lodash')

// Based on https://github.com/jsynowiec/good-sentry (MIT)
// @see https://github.com/getsentry/raven-node/blob/master/docs/usage.rst

class GoodSentry extends Stream.Writable {
  constructor (options) {
    super({objectMode: true, decodeStrings: false})
    this.options = options || {}

    this.init().catch(err => {
      console.error('Unable to register sentry logger', err)
    })
  }

  async init () {
    // Get project & environment info
    const {git_short} = await this.project_info()

    // @see https://docs.sentry.io/clients/node/config
    this._client = Raven.config(this.options.dsn, hoek.applyToDefaults({
      release: git_short,
      captureUnhandledRejections: true

    }, this.options))

    // Install globally
    this._client.install()

    // Expose client to server.plugins.sentry
    if (this.options.server) {
      this.options.server.decorate('server', 'sentry', this._client)
    }
  }

  project_info () {
    return new Promise((resolve, reject) => {
      git.short(function (git_short) {
        resolve({git_short})
      })
    })
  }

  _write (_data, encoding, cb) {
    let {tags = [], data = {}} = _data

    // Don't report logs without error or message
    if (!data.error && !data.message) return cb()

    // Normalize event tags - if its a string then wrap in an array, default to an empty array
    if (typeof tags === 'string') tags = [tags]

    // Log level
    let level = 'debug'
    if (hoek.contain(tags, ['fatal'], {part: true})) {
      level = 'fatal'
    } else if (hoek.contain(tags, ['err', 'error'], {part: true})) {
      level = 'error'
    } else if (hoek.contain(tags, ['warn', 'warning'], {part: true})) {
      level = 'warning'
    } else if (hoek.contain(tags, ['info'], {part: true})) {
      level = 'info'
    }

    // Filter-out level tags and keep others
    // Then convert array to mapping for sentry api compatibility
    let sentry_tags = tags.filter(
      tag => ['fatal', 'error', 'err', 'warning', 'warn', 'info', 'debug'].indexOf(tag) === -1
    ).reduce((acc, curr) => {
      let split = curr.split(':', 2)
      acc[split[0]] = split[1] || true
      return acc
    }, {})

    // Additional data
    // @see https://docs.sentry.io/clients/node/usage/#additional-data
    const additionalData = {
      level,
      tags: sentry_tags,
      extra: _.omit(data, ['user', 'error', 'message', '_sentry_callback'])
    }

    // User
    if (data.user) {
      additionalData.user = data.user.toJSON ? data.user.toJSON() : data.user
      additionalData.user = _.pick(additionalData.user, ['_id', 'email', 'name'])
    }

    // Try to convert all extra keys to json form
    Object.keys(additionalData.extra).forEach(key => {
      if (!additionalData.extra[key]) { delete additionalData.extra[key] } else if (additionalData.extra[key].toJSON) { additionalData.extra[key] = additionalData.extra[key].toJSON() }
    })

    // Capture
    let id
    if (data.error) {
      id = this._client.captureException(data.error, additionalData)
    } else {
      id = this._client.captureMessage(data.message, additionalData)
    }

    // Callback to context
    if (data._sentry_callback) {
      data._sentry_callback(id)
    }

    // Stream callback
    cb()
  }
}

module.exports = GoodSentry
