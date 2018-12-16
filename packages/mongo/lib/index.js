const Mongoose = require('mongoose')
const Model = require('./model')

exports.register = function (server, config = {}) {
  const _Mongoose = config.Mongoose || Mongoose

  // Use native promises
  _Mongoose.Promise = global.Promise

  // Use custom function to log collection methods + arguments
  _Mongoose.set('debug', config.debug)

  // Register cachegoose
  // @see https://github.com/boblauer/cachegoose
  if (config.cache !== false) {
    const cachegoose = require('cachegoose')
    cachegoose(_Mongoose, config.cache)
  }

  // @see https://github.com/whitecolor/mongoose-fill
  if (config.fill !== false) {
    require('mongoose-fill')
  }

  const queue = Object.keys(config.connections).map(connection_name => {
    let connection = config.connections[connection_name]
    if (typeof connection === 'string') {
      connection = { uri: connection }
    }

    const options = Object.assign({
      promiseLibrary: global.Promise,
      useNewUrlParser: true,
      useCreateIndex: true
    }, connection.options)

    if (connection_name === 'default') {
      return _Mongoose.connect(connection.uri, options)
    }
    return _Mongoose.createConnection(connection.uri, options)
  })

  return Promise.all(queue)
}

exports.pkg = require('../package.json')
exports.once = true
exports.configKey = 'mongo'

exports.Model = Model
exports.Schema = Mongoose.Schema
exports.Mongoose = Mongoose
