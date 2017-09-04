const Mongoose = require('mongoose')

// Use native promises
Mongoose.Promise = global.Promise

const MongoosePlugin = {
  register (server, config = {}, next) {
    // Register mongoose-fill
    // @see https://github.com/whitecolor/mongoose-fill
    if (config.fill !== false) {
      // She will register itself!!
      require('mongoose-fill')
    }

    // Use custom function to log collection methods + arguments
    Mongoose.set('debug', config.debug)

    // Register cachegoose
    // @see https://github.com/boblauer/cachegoose
    if (config.cache !== false) {
      // Require only when needed
      const cachegoose = require('cachegoose')
      cachegoose(Mongoose, config.cache)
    }

    let queue = Object.keys(config.connections).map(connection_name => {
      const connection = config.connections[connection_name]

      const clientOptions = {
        useMongoClient: true,
        promiseLibrary: global.Promise
      }

      if (connection_name === 'default') {
        return Mongoose.connect(connection.uri, clientOptions)
      }
      return Mongoose.createConnection(connection.uri, clientOptions)
    })

    Promise.all(queue).then(() => {
      next()
    }).catch((e) => {
      console.log('[mongoose]', e)
    })
  }
}

MongoosePlugin.register.attributes = {
  name: 'bak-mongo'
}

module.exports = MongoosePlugin
