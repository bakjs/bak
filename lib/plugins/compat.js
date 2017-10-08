exports.register = function (server, config) {
  server.decorate('server', 'on', function (event, listener) {
    if (event === 'tail') {
      console.warn('ignoring tail event')
      return
    }
    server.events.on(event, listener)
  })
}

exports.register.attributes = {
  name: 'bak-compat'
}
