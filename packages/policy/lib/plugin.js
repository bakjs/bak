const GuardPlugin = require('./guard')
const AuthorizePlugin = require('./authorize')

exports.register = function (server, options, next) {
    if (!options) options = {}

    server.register({ register: GuardPlugin, options })

    server.register({ register: AuthorizePlugin, options })

    next()
}

exports.register.attributes = {
    name: 'bak-policy'
}
