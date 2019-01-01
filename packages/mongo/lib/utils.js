// Utiliy function to setup logger on db
function setupLogger(db, logger) {
  // Emitted after getting disconnected from the db.
  // Ready Status: 0
  db.on('disconnected', () => {
    logger.debug('Disconnected!');
  });

  // Emitted when this connection successfully connects to the db.
  // May be emitted multiple times in reconnected scenarios.
  // Ready Status: 1
  db.on('connected', () => {
    logger.debug('Connected!');
  });

  // Emitted when connection.{open,openSet}() is executed on this connection.
  // Ready Status: 2
  db.on('connecting', () => {
    logger.debug('Connecting to MongoDB...');
  });

  // Emitted when an error occurs on this connection.
  db.on('error', (error) => {
    logger.error(error);
  });

  // Emitted after we connected and onOpen is executed
  // on all of this connections models.
  db.once('open', () => {
    logger.debug('Connection opened!');
  });

  // Emitted after we connected and subsequently disconnected,
  // followed by successfully another successfull connection.
  db.on('reconnected', () => {
    logger.debug('Reconnected!');
  });

  // Emitted when connection.close() was executed.
  db.on('disconnecting', () => {
    logger.debug('Disconnecting...')
  })

  // Emitted in a replica-set scenario, when all nodes specified
  // in the connection string are connected.
  db.on('fullsetup', () => {
    logger.debug('ReplicaSet ready!')
  })
}

// Utility function to reconnect db on disconnect
function setupForceReconnect(db) {
  db.on('error', () => {
    db.disconnect();
  })
  db.on('disconnected', () => {
    setTimeout(() => db.connect(), 1000)
  });
}

module.exports = {
  setupLogger,
  setupForceReconnect
}
