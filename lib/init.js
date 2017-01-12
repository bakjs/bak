const Server = require('./server');
const {fatal} = require('./helpers');

/**
 *
 * @param config
 * @returns {Promise.<Server>}
 */
module.exports = function init(config) {
    // Create server instance
    const server = global.server = new Server(config);

    // Start server
    return server.init()
        .then(server => {
            console.log(`Server running at: ${server.hapi.info.uri}`);
            return server;
        })
        .catch(fatal);
};