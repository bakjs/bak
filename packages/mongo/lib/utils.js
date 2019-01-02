const consola = require('consola').withTag('MongoDB')

// Utiliy function to setup logger on db
function logConnectionEvents (conn) {
  // Emitted after getting disconnected from the db.
  // _readyState: 0
  conn.on('disconnected', () => {
    conn.$logger.debug('Disconnected!')
  })

  // Emitted when this connection successfully connects to the db.
  // May be emitted multiple times in reconnected scenarios.
  // _readyState: 1
  conn.on('connected', () => {
    conn.$logger.success('Connected!')
  })

  // Emitted when connection.{open,openSet}() is executed on this connection.
  // _readyState: 2
  conn.on('connecting', () => {
    conn.$logger.info('Connecting...')
  })

  // Emitted when connection.close() was executed.
  // _readyState: 3
  conn.on('disconnecting', () => {
    conn.$logger.debug('Disconnecting...')
  })

  // Emitted when an error occurs on this connection.
  conn.on('error', (error) => {
    conn.$logger.error(error)
  })

  // Emitted after we connected and onOpen is executed
  // on all of this connections models.
  conn.on('open', () => {
    conn.$logger.debug('Connection opened!')
  })

  // Emitted after we connected and subsequently disconnected,
  // followed by successfully another successfull connection.
  conn.on('reconnected', () => {
    conn.$logger.debug('Reconnected!')
  })

  // Emitted in a replica-set scenario, when all nodes specified
  // in the connection string are connected.
  conn.on('fullsetup', () => {
    conn.$logger.debug('ReplicaSet ready!')
  })
}

// Utility function to setup a connection
async function connect (mongoose, connectionName, connectionOpts) {
  const isDefault = connectionName === 'default'

  // Normalize and destructure connection options
  if (typeof connectionOpts === 'string') {
    connectionOpts = { uri: connectionOpts }
  }
  let { uri, options, forceReconnect } = connectionOpts

  // Apply default options
  // https://mongoosejs.com/docs/connections.html#options
  options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    ...options
  }

  // Manualy create connection
  let conn
  if (isDefault) {
    conn = mongoose.connection
  } else {
    conn = new mongoose.Connection(mongoose)
    mongoose.connections.push(conn)
  }

  // $logger helper
  conn.$logger = isDefault
    ? consola
    : consola.withTag(connectionName)

  // Log connection events
  logConnectionEvents(conn)

  // $connect helper
  conn.$connect = () => {
    return new Promise((resolve, reject) => {
      conn.openUri(uri, options, (error, a) => {
        if (error) {
          reject(error)
        } else {
          resolve(conn)
        }
      })
    })
  }

  // Make accessable via mongoose.$connectionName
  mongoose['$' + connectionName] = conn

  // Setup force reconnect
  if (forceReconnect) {
    const timeout = forceReconnect === true ? 1000 : forceReconnect
    conn.on('error', () => {
      conn.close()
    })
    conn.on('disconnected', () => {
      setTimeout(() => { conn.$connect() }, timeout)
    })
  }

  // Connect
  await conn.$connect()
  await conn.$initialConnection
}

module.exports = {
  connect,
  consola
}
