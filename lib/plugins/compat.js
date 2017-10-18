function supportEvents (server, config) {
  server.decorate('server', 'on', function (event, listener) {
    // https://github.com/hapijs/hapi/issues/3571
    if (event === 'tail') {
      return
    }
    server.events.on(event, listener)
  })
}

function isPlugin (obj) {
  return obj && Boolean(typeof obj === 'string' || obj.pkg || obj.attributes || typeof obj.register === 'function')
}

function wrapPlugin (originalPlugin) {
  const plugin = Object.assign({}, originalPlugin)

  // Support for attributes instead of pkg
  if (plugin.attributes) {
    if (!plugin.pkg) {
      plugin.pkg = plugin.attributes
    }
    delete plugin.attributes
  }

  return plugin
}

function wrapRegister (originalRegister) {
  return function (registration, options) {
    // Clone to avoid mutating keys of original registration
    registration = Object.assign({}, registration)

    // Support for old { register } syntax
    if (isPlugin(registration.register)) {
      registration.plugin = registration.register
      delete registration.register
    }

    // Wrap plugin
    if (isPlugin(registration)) {
      registration = wrapPlugin(registration)
    } else {
      registration.plugin = wrapPlugin(registration.plugin)
    }

    // Call to original register
    return originalRegister.call(this, registration, options)
  }
}

function supportRegistrations (server, config) {
  const hapi = config._bak.server.hapi
  hapi.register = wrapRegister(hapi.register)
}

exports.register = function bakCompat (server, config) {
  supportEvents(server, config)
  supportRegistrations(server, config)
}

exports.name = 'bak-compat'
