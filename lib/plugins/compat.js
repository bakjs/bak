exports.register = function (server, config) {
  server.decorate('server', 'on', function (event, listener) {
    // https://github.com/hapijs/hapi/issues/3571
    if (event === 'tail') {
      return
    }

    server.events.on(event, listener)
  })
}

exports.register.attributes = {
  name: 'bak-compat'
}
