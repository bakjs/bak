const RoutesPlugin = require('./routes');
const GoodPlugin = require('./good');

const LoggingPlugin = {

    register: function (server, options, next) {

        let plugins = [];

        plugins.push({
            register: GoodPlugin,
            options
        });

        if (process.env.NODE_ENV !== 'production') {
            plugins.push(RoutesPlugin);
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