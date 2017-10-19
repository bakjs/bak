function isPlugin (obj) {
  return obj && Boolean(obj.pkg || typeof obj.register === 'function')
}

function wrapPlugin (originalPlugin) {
  const plugin = Object.assign({}, originalPlugin)

  // Support for attributes
  if (plugin.register.attributes && !plugin.pkg) {
    plugin.pkg = plugin.register.attributes.pkg || plugin.register.attributes
    delete plugin.register.attributes
  }

  // Wrap register function
  const originalRegister = originalPlugin.register

  plugin.register = function (server, options) {
    return new Promise((resolve, reject) => {
      // TODO: detect and support 3rd (next) argument

      // Recursively add compat support as each plugin has it's own server realm
      install(server, false)

      const result = originalRegister.call(this, server, options)

      return resolve(result)
    })
  }

  return plugin
}

function wrapServerRegister (originalServerRegister) {
  const serverRegister = function (registration, options) {
    if (Array.isArray(registration)) {
      return Promise.all(registration.map(r => serverRegister.call(this, r, options)))
    }

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
    console.log(registration)
    // Call to original register
    return originalServerRegister.call(this, registration, options)
  }
  return serverRegister
}

function supportRegistrations (server) {
  server.register = wrapServerRegister(server.register)
}

function supportEvents (server) {
  server.decorate('server', 'on', function (event, listener) {
    // https://github.com/hapijs/hapi/issues/3571
    if (event === 'tail') {
      return
    }
    server.events.on(event, listener)
  })
}

function install (server, isRoot) {
  if (isRoot) {
    supportEvents(server)
  }

  supportRegistrations(server)
}

exports.register = function bakCompat (server, config) {
  const rootServer = config._bak.server.hapi
  install(rootServer, true)
}

exports.name = 'bak-compat'
