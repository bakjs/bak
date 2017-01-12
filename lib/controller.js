const {trimSlash} = require('./helpers');

module.exports = class Controller {

    /**
     *
     * @param config
     */
    constructor(config) {
        this.config = config || {};

        this.baseUrl = trimSlash(this.config.baseUrl || '/');

        if (!this.config.plugins) this.config.plugins = {};
    }


    plugin(name, conf) {
        if (!this.config.plugins[name])
            this.config.plugins[name] = {};
        this.config.plugins[name] = Object.assign({}, conf, this.config.plugins[name]);
    }

    get routes() {
        return []; // TODO
    }

};