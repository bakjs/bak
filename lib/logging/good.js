const GoodSentry = require('./sentry');

const GoodPlugin = {
    register(server, config, next) {
        const reporters = {};

        // Default squeeze filter
        const squeeze = {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{log: '*'}]
        };

        // Sentry reporter
        if (config.sentry && config.sentry.dsn) {
            reporters.sentry = [
                squeeze,
                {
                    module: GoodSentry,
                    args: [{
                        server,
                        dsn: config.sentry.dsn,
                        config: config.sentry,
                    }]
                }
            ];
        }

        // Console reporter
        if (process.env.NODE_ENV !== 'production' && !reporters.sentry) {
            reporters.console = [
                squeeze,
                {module: 'good-console'},
                'stdout'
            ];
        }

        server.register({
            register: require('good'),
            options: {reporters}
        }, (err) => {
            if (err) console.error(err);
            if (next) next();
        });
    }
};

GoodPlugin.register.attributes = {
    name: 'bak-good',
};

module.exports = GoodPlugin;