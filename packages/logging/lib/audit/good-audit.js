const Stream = require('stream')
const Audit = require('./model')

class GoodAudit extends Stream.Writable {
  constructor (options) {
    super({objectMode: true, decodeStrings: false})
    this.options = options || {}
  }

  _write (_data, encoding, cb) {
    // https://github.com/hapijs/good/blob/master/API.md#requestlog
    let {tags = [], data = {}} = _data

    // Only accept audit logs
    if (tags !== 'audit' && tags.indexOf('audit') === -1) {
      return cb()
    }

    // New audit entry
    const audit = new Audit(data)

    // Save async
    audit.save()

    // Stream callback
    cb()
  }
}

module.exports = GoodAudit
