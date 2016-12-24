import Mongorito from 'mongorito';
import get from 'get-value';
import clone from 'clone';

// ============================================================================
// Hapi Plugin
// ============================================================================

const HapiMongoritoPlugin = {
    register: function (server, config, next) {

        if (global.mongo) {
            console.warn('[Mongo] Plugins seems to be already registred, this may cause troubles!')
        } else {
            global.mongo = {
                connections: [],
            }
        }

        let p = config.connections.map(database => new Promise((resolve, reject) => {
            //console.log(`[Mongo] connecting to ${database.name} ...`);
            try {
                Mongorito.connect(database.uri).then((db) => {
                    global.mongo.connections[database.name] = db;
                    resolve(true);
                });
            } catch (e) {
                reject(`[Mongo] Cannot connect to ${database.name} : ${e}`);
            }
        }));

        Promise.all(p).then(() => {
            next();
        });
    }
};

HapiMongoritoPlugin.register.attributes = {
    pkg: {
        name: 'mongo',
        version: '0.0.0'
    }
};

const HapiMongoritoPluginFactory = function (options) {
    return {
        register: HapiMongoritoPlugin,
        options,
    }
};

HapiMongoritoPluginFactory.attributes = HapiMongoritoPlugin.register.attributes;

// ============================================================================
// Enhanced Model
// ============================================================================

class MongoritoModel extends Mongorito.Model {

    constructor(attrs, options) {
        super(attrs, options);
        // John L. http://stackoverflow.com/questions/37714787
        let proxy = new Proxy(this, MongoritoModel.proxy);

        // TODO: bind all class functions to proxy

        return proxy;
    }

    resolve(value, ...args) {
        if (value instanceof Function)
            return value.bind(this)(...args);
        else return value;
    }

    static proxy = {
        set: (target, property, value,) => {
            target.set(property, value);
            return true;
        },
        get: function (target, property) {
            let v = target[property];

            if (typeof v === Function) {
                return v.bind(this);
            }

            if (v === undefined) v = target.get(property);
            return v;
        }
    };

    get(key) {
        // if key is empty, return all attributes
        let value = key ? get(this.attributes, key) : this.attributes;

        // appends fields
        if (this.constructor.appends) {
            if (key) {
                if (this.constructor.appends.indexOf(key) !== -1) {
                    value = this.resolve(get(this, key), value);
                }
            } else {
                this.constructor.appends.forEach(key => {
                    value[key] = this.resolve(this[key], value[key]);
                });
            }
        }

        // if value is object, return a deep copy
        return value && value.constructor === Object ? clone(value) : value;
    };

    toJSON() {
        let json = this.get();

        if (this.constructor.hidden) {
            this.constructor.hidden.forEach(key => {
                delete json[key];
            });
        }

        return json;
    };

}

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
    plugin: HapiMongoritoPluginFactory,
    Model: MongoritoModel,
};
