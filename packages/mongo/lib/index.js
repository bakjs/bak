const Mongoose = require('mongoose')
const consola = require('consola')
const Model = require('./model')
const { setupLogger, setupAutoReconnect } = require('./utils')

// Create a tagged logger
const mongoLogger = consola.withTag('MongoDB')

exports.register = function (server, config = {}) {
  const _Mongoose = config.Mongoose || Mongoose

  // Use native promises
  _Mongoose.Promise = global.Promise

  // https://mongoosejs.com/docs/api.html#mongoose_Mongoose-set
  const supportedSetKeys = [
    'debug',
    'bufferCommands',
    'useCreateIndex',
    'useFindAndModify',
    'useNewUrlParser',
    'cloneSchemas',
    'applyPluginsToDiscriminators',
    'objectIdGetter',
    'runValidators',
    'toObject',
    'toJSON',
    'strict',
    'selectPopulatedPaths'
  ]
  for (const key of supportedSetKeys) {
    if (config[key] !== undefined) {
      _Mongoose.set(key, config[key])
    }
  }

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

  return Promise.all(Object.keys(config.connections).map(async connectionName => {
    // Normalize connection options
    let connectionOpts = config.connections[connectionName]
    if (typeof connectionOpts === 'string') {
      connectionOpts = { uri: connectionOpts }
    }

    // Merge options
    // https://mongoosejs.com/docs/connections.html#options
    const options = Object.assign({
      promiseLibrary: global.Promise,
      useNewUrlParser: true,
      useCreateIndex: true
    }, connectionOpts.options)

    // Create a scopped logger
    if (connectionOpts.logger === undefined) {
      connectionOpts.logger = mongoLogger.withTag(name)
    }

    // Connect to db
    let db
    if (connection_name === 'default') {
      db = await _Mongoose.connect(connectionOpts.uri, options)
    } else {
      db = await _Mongoose.createConnection(connectionOpts.uri, options)
    }

    // Setup logger
    if (connectionOpts.logger !== false) {
      setupLogger(db, connectionOpts.logger)
    }

    // Setup auto-reconnect
    if (connectionOpts.forceReconnect === true) {
      setupForceReconnect(db)
    }
  }))
}

exports.pkg = require('../package.json')
exports.once = true
exports.configKey = 'mongo'

exports.Model = Model
exports.Schema = Mongoose.Schema
exports.Mongoose = Mongoose
