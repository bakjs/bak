const Mongoose = require('mongoose')
const Model = require('./model')
const { connect, consola } = require('./utils')

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

  // Connect to all connections
  const connectionNames = Object.keys(config.connections)
  for (const connectionName of connectionNames) {
    await connect(_Mongoose, connectionName, config.connections[connectionName])
  }

  // Add h.mongoose
  server.decorate('toolkit', 'mongoose', _Mongoose)
}

exports.pkg = require('../package.json')
exports.once = true
exports.configKey = 'mongo'

exports.Model = Model
exports.Schema = Mongoose.Schema
exports.Mongoose = Mongoose
