const plugin = require('./plugin')
const User = require('./provider/user')

module.exports = {
  default: plugin,
  User
}
