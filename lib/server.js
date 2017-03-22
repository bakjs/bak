const Hapi = require('hapi');
const {normalizePath, fatal} = require('./helpers');
const Controller = require('./controller');

class Server {

    /**
     *
     * @param config
     */
    constructor(config) {
        this.config = config;
        this.route = this.route.bind(this);
        this.register = this.register.bind(this);
        this.init = this.init.bind(this);
    }

    /**
     *
     * @returns {Promise.<Server>}
     */
    async init() {
        // Create server
        this.hapi = new Hapi.Server();

        // Set server connection
        this.hapi.connection({port: this.config.port || 3000, host: this.config.host || '0.0.0.0'});

        // Register plugins
        let plugins = this.config.plugins.map(this.register);
        await Promise.all(plugins);

        // Register routes
        await this.route(this.config.routes);

        // Start server
        await this._start();

        return this;
    }

    /**
     *
     * @returns {Promise}
     * @private
     */
    _start() {
        return new Promise((resolve, reject) => {
            this.hapi.initialize((err) => {
                if (err) return reject(err);
                this.hapi.start((err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }).catch(e => {
            console.error('Error starting hapi server: ', e);
        });
    }

    /**
     *
     * @param obj
     * @returns {*}
     * @private
     */
    _lazy_load(obj) {
        if (obj.prototype instanceof Controller) {
            try {
                obj = new obj();

                // Inject server & hapi to controller instance
                obj.server = this;
                obj.hapi = this.hapi;

                return obj.routes();
            } catch (e) {
                fatal("Error while lazy loading controller ", e, obj);
            }
        } else if (obj instanceof Function) {
            try {
                obj = obj(this);
            } catch (e) {
                fatal("Error while lazy loading function ", e, obj);
            }
        }
        return obj;
    }

    /**
     *
     * @param routes
     * @param prefix
     * @returns {Array}
     * @private
     */
    _resolve_routes(routes, prefix) {
        prefix = prefix || '';
        let res = [];
        routes = this._lazy_load(routes);

        routes.forEach((route) => {
            route = this._lazy_load(route);

            // Simple nested routes
            if (route instanceof Array) {
                this._resolve_routes(route, prefix).forEach((r) => {
                    res.push(r)
                });
                return;
            }

            // Prefixed nested routes
            if (route instanceof Object && route.prefix) {
                res = res.concat(this._resolve_routes(route.routes,
                    (prefix.length ? prefix + '/' : '') + route.prefix
                ));
                return;
            }

            // Add route prefix
            if (prefix.length) {
                let path = normalizePath(prefix + route.path);
                route = Object.assign(route, {path});
            }

            if (route.path === '') {
                route.path = '/';
            }

            res.push(route);
        });

        return res;
    }

    /**
     *
     * @param routes
     * @returns {Promise}
     */
    route(routes) {
        return new Promise((resolve, reject) => {

            // Resolve
            try {
                routes = this._resolve_routes(routes);
            } catch (e) {
                fatal("Error while resolving routes", e);
            }

            // Handle empty routes
            if (!routes || routes.length == 0)
                return resolve();

            // Register
            try {
                this.hapi.route(routes);
            } catch (e) {
                fatal("Error while registering routes", e);
            }

            resolve();
        }).catch(err => {
            fatal('Error adding routes', err);
        });
    }

    /**
     *
     * @param plugin
     * @returns {Promise}
     */
    register(plugin) {
        return new Promise((resolve, reject) => {
            try {
                if (!plugin) return resolve(null);

                this.hapi.register(plugin, (err) => {
                    if (err) return reject(err);

                    // OK
                    resolve(plugin);
                });
            } catch (e) {
                fatal("Error while registering plugin", e);
            }
        });
    }

}

module.exports = Server;
