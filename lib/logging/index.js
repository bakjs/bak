const RoutesPlugin = require('./routes');
const GoodPlugin = require('./good');

const LoggingPlugin = {

    register: function (server, options, next) {

        let plugins = [];

        plugins.push({
            register: GoodPlugin,
            options
        });

        // Non production logging
        if (process.env.NODE_ENV !== 'production') {

            // Print routes on server startup
            plugins.push(RoutesPlugin);

            // Print full error traces to console
            server.on('log', (event, tags) => {
                if (tags.error) {
                    console.error(event);
                }
            });
        }

        server.register(plugins, (err) => {
            if (err) console.error(err);
            if (next) next();
        });
    }
};


LoggingPlugin.register.attributes = {
    pkg: {
        name: 'bak-logging',
    }
};

module.exports = LoggingPlugin;