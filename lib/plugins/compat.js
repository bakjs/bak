exports.register = function (server, config) {
  server.decorate('server', 'on', function (event, listener) {
    // https://github.com/hapijs/hapi/issues/3571
    if (event === 'tail') {
      return
    }

    server.events.on(event, listener)
  })

  // Wrap plugin for 16.x compatibility
  const noopNext = () => { }
  const hapi = config.$bak.server.hapi
  const _register = hapi.register

  hapi.register = (plugin, options) => {
    const _plugin = function (server, config, next) {
      return plugin.call(this, server, config, next || noopNext)
    }
    _register(_plugin, options)
  }
}

exports.register.attributes = {
  name: 'bak-compat'
}
