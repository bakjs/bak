const Hapi = require('hapi');

class Server {

    constructor(config) {
        this.config = config;
        this.route = this.route.bind(this);
        this.register = this.register.bind(this);
        this.init = this.init.bind(this);
    }

    _create_server() {
        let server = new Hapi.Server();
        server.connection({port: this.config.port || 3000, host: this.config.host || '0.0.0.0'});
        return server;
    }

    async init() {
        // Create server
        this.server = this._create_server();

        // Register plugins
        let plugins = this.config.plugins.map(this.register);
        await Promise.all(plugins);

        // Register routes
        await this.route(this.config.routes);

        // Start server
        await this._start();

        return this;
    }

    _start() {
        return new Promise((resolve, reject) => {
            this.server.start((err) => {
                if (err) return reject(err);
                resolve();
            });
        }).catch(e => {
            console.error('Error starting server: ' + e);
        });
    }

    _resolve_routes(routes, prefix) {
        prefix = prefix || '';

        // Lazy routes
        if (routes instanceof Function) routes = routes(this);

        let res = [];

        routes.forEach((route) => {
            // Lazy route
            if (route instanceof Function) route = route(this);

            // Simple Nested routes
            if (route instanceof Array) {
                res = res.concat(this._resolve_routes(route, prefix));
                return;
            }

            // Prefixed Nested routes
            if (route instanceof Object && route.prefix) {
                res = res.concat(this._resolve_routes(route.routes,
                    (prefix.length ? prefix + '/' : '') + route.prefix
                ));
                return;
            }

            // Add route prefix
            if (prefix.length) {
                let path = (prefix + route.path).replace(/\/\//g, '/');
                if (path.lastIndexOf('/') === path.length - 1)
                    path = path.substr(0, path.length - 1);
                route = Object.assign(route, {path});
            }

            res.push(route);
        });

        return res;
    }

    route(routes) {
        return new Promise(async(resolve, reject) => {

            // Resolve routes
            try {
                routes = this._resolve_routes(routes);
            } catch (e) {
                this.fatal("Error while resolving route", e, routes);
            }

            // Register
            try {
                this.server.route(routes);
            } catch (e) {
                this.fatal("Error while registering route", e, routes);
            }

            // Log
            let colorify = method => {
                method = method.toUpperCase();
                switch (method) {
                    case 'GET':
                        return cyan(method);
                    case 'POST':
                        return red(method);
                    default:
                        return magenta(method);
                }
            };
            console.info(grey(`----------------------------------`));
            routes.forEach(route => {
                console.log(`[${colorify(route.method)}]\t${route.path.replace(/\//g, grey('/'))}`);
            });
            console.info(grey(`----------------------------------`));

            // Pass
            resolve();
        }).catch(err => {
            console.error(err);
            console.error('Error adding route: ' + err);
        });
    }

    register(plugin) {
        return new Promise((resolve, reject) => {
            try {
                this.server.register(plugin, (err) => {
                    if (err) return reject(err);
                    if (plugin.next)
                        plugin.next({resolve, reject, server: this.server, options});
                    else
                        resolve();
                });
            } catch (e) {
                this.fatal("Error while registering plugin", e, plugin);
            }
        });
    }

    fatal(msg, error, additional) {
        console.error(msg);
        console.error(additional);
        if (error) console.error(error);
        process.exit(1);
    }

}

module.exports = Server;
