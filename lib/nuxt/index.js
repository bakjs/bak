const config = require('config');
const Hapi = require('hapi');
const H2O2 = require('h2o2');
const Inert = require('inert');
const Path = require('path');
const Nuxt = require('./nuxt');
const Chalk = require('chalk');

// Config API Endpoint
// const api_config = config.get('api');
// process.env.ENDPOINT = `${api_config.protocol}://${api_config.host}:${api_config.port}`;

const NuxtPlugin = {
    register: function (server, config, next) {

        // Create nuxt instance
        const nuxt = Nuxt(config);

        // Register dependency plugins
        server.register([
            {register: H2O2},
            {register: Inert},

        ], (err) => {
            if (err) throw err;

            // Routes Static Assets
            // server.route({
            //     method: 'GET',
            //     path: '/static/{param*}',
            //     handler: {
            //         directory: {
            //             path: Path.resolve(rootDir, 'static')
            //         }
            //     }
            // });

            // Routes for nuxt handler
            server.route({
                method: '*',
                path: '/{path*}',
                config: {
                    id: 'NuxtController.render',
                },
                handler: function (request) {
                    if (request.path == '/favicon.ico') return;

                    if (request.path.indexOf('/_') !== 0)
                        console.log(Chalk.green('[Nuxt]'), request.path);

                    let {req, res} = request.raw;
                    nuxt.render(req, res);
                }
            });

            // Build bundle
            console.log(Chalk.yellow("[Nuxt]"), "Building...");
            nuxt.build().then(() => {
                if (next) next();
            }).catch((err) => {
                console.error(err);
                process.exit(1);
            });

        });

    }
};

NuxtPlugin.register.attributes = {
    pkg: {
        name: 'Nuxt',
    }
};

module.exports = NuxtPlugin;

