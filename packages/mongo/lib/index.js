const Mongoose = require('mongoose')
const consola = require('consola')
const Model = require('./model')
const { setupLogger, setupForceReconnect } = require('./utils')

// Create a tagged logger
const mongoLogger = consola.withTag('MongoDB')

exports.register = async function (server, config = {}) {
  const _Mongoose = config.Mongoose || Mongoose

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

  const connectionNames = Object.keys(config.connections)

  for (const connectionName of connectionNames) {
    // Normalize and destructure connection options
    let connectionOpts = config.connections[connectionName]
    if (typeof connectionOpts === 'string') {
      connectionOpts = { uri: connectionOpts }
    }
    let { uri, options, logger, forceReconnect } = connectionOpts

    // Apply default options
    // https://mongoosejs.com/docs/connections.html#options
    options = {
      useNewUrlParser: true,
      useCreateIndex: true,
      ...options
    }

    // Create a scopped logger
    if (logger === undefined) {
      logger = mongoLogger.withTag(connectionName)
    }

    // Setup helper
    const setupDB = (db) => {
      // Setup logger
      if (logger !== false) {
        setupLogger(db, logger)
      }

      // Setup forceReconnect
      if (forceReconnect) {
        setupForceReconnect(db, uri, options,
          forceReconnect === true ? 1000 : forceReconnect)
      }
    }

    // Connect to db
    if (connectionName === 'default') {
      setupDB(_Mongoose.connection)
      await _Mongoose.connect(uri, options)
    } else {
      const db = await _Mongoose.createConnection(uri, options)
      setupDB(db)
    }
  }
}

exports.pkg = require('../package.json')
exports.once = true
exports.configKey = 'mongo'

exports.Model = Model
exports.Schema = Mongoose.Schema
exports.Mongoose = Mongoose
