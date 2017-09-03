const authorize = require('./authorize')
const guard = require('./guard')
const plugin = require('./plugin')

module.exports = {
    authorize,
    guard,
    default: plugin
}