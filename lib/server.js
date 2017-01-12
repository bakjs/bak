const Hapi = require('hapi');
const {normalizePath, fatal} = require('./helpers');

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
            this.hapi.start((err) => {
                if (err) return reject(err);
                resolve();
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
        if (obj instanceof Function) {
            try {
                obj = obj(this);
            } catch (e) {
                obj = null;
                fatal("Error while lazy loading", e, obj);
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
        routes = this._lazy_load(routes);

        let res = [];

        routes.forEach((route) => {
            route = this._lazy_load(route);

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
                let path = normalizePath(prefix + route.path);
                route = Object.assign(route, {path});
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
            // Resolve routes
            try {
                routes = this._resolve_routes(routes);
            } catch (e) {
                fatal("Error while resolving route", e, routes);
            }

            // Register
            try {
                this.hapi.route(routes);
            } catch (e) {
                fatal("Error while registering route", e, routes);
            }

            // OK
            resolve(routes);
        }).catch(err => {
            console.error(err);
            console.error('Error adding route: ' + err);
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
                this.hapi.register(plugin, (err) => {
                    if (err) return reject(err);

                    // OK
                    resolve(plugin);
                });
            } catch (e) {
                fatal("Error while registering plugin", e, plugin);
            }
        });
    }

}

module.exports = Server;
