const Mongoose = require('mongoose')
const consola = require('consola')
const Model = require('./model')

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

  const queue = Object.keys(config.connections).map(connection_name => {
    let connection = config.connections[connection_name]
    if (typeof connection === 'string') {
      connection = { uri: connection }
    }

    // https://mongoosejs.com/docs/connections.html#options
    const options = Object.assign({
      promiseLibrary: global.Promise,
      useNewUrlParser: true,
      useCreateIndex: true
    }, connection.options)
    
    function connect() {
      if (connection_name === 'default') {
        return _Mongoose.connect(connection.uri, options)
      }
      return _Mongoose.createConnection(connection.uri, options)
    }

    const db = _Mongoose.connection;

    db.on('connecting', () => {
      consola.debug('connecting to MongoDB...');
    });

    db.on('error', (error) => {
      consola.error('Error in MongoDb connection: ' + error);
      _Mongoose.disconnect();
    });
    db.on('connected', () => {
      consola.debug('MongoDB connected!');
    });
    db.once('open', () => {
      consola.debug('MongoDB connection opened!');
    });
    db.on('reconnected', () => {
      consola.debug('MongoDB reconnected!');
    });
    db.on('disconnected', () => {
      consola.debug('MongoDB disconnected!');
      setTimeout(() => connect(), 1000)
    });

    return connect()
  })

  return Promise.all(queue)
}

exports.pkg = require('../package.json')
exports.once = true
exports.configKey = 'mongo'

exports.Model = Model
exports.Schema = Mongoose.Schema
exports.Mongoose = Mongoose
