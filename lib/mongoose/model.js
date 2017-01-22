const Mongoose = require('./mongoose');
const _ = require('lodash');

module.exports = class MongooseModel {

    static $make_model(name, collection, connection) {
        let _collection = collection;
        let _name = name || this.name;
        let _connection = connection || Mongoose;

        let _schema = this.$schema || {};

        let _options = _.defaultsDeep({}, this.$options, {
            toObject: {
                virtuals: true,
                getters: true,
                transform: transform.bind(this),
            },
            toJSON: {
                getters: true,
                transform: transform.bind(this),
            },
            id: false,
            versionKey: false,
            timestamps: {
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        });

        // Create mongoose schema
        let schema = new Mongoose.Schema(_schema, _options);
        if (this.$wrap_schema) schema = this.$wrap_schema(schema) || schema;

        // Add methods from class to schema
        schema.plugin(wrap, this);

        // Create and return a mongoose model using connection
        let model = _connection.model(_name, schema, _collection/*optional*/, false/*skipInit*/);
        model.$schema = schema;

        return model;
    }

    static get $model() {
        return this.$make_model(this.$name, this.$collection, this.$connection);
    }

    static $transform() {

    }
};

function transform(doc, ret, options) {
    if (this.$visible) {
        return _.pickBy(ret, (value, key) => this.$visible.indexOf(key) !== -1);
    } else if (this.$hidden) {
        return _.omitBy(ret, (value, key) => this.$hidden.indexOf(key) !== -1);
    }
    return ret;
}

function wrap(schema, target, hooks = []) {
    // Based on https://github.com/aksyonov/mongoose-class-wrapper (MIT)

    let proto = target.prototype;
    let parent = Object.getPrototypeOf(target);
    let staticProps = Object.getOwnPropertyNames(target);
    let prototypeProps = Object.getOwnPropertyNames(proto);
    let instanceProps = prototypeProps.filter(name => name !== 'constructor');

    // Wrap parent first
    if (parent.name) wrap(schema, parent, hooks);

    // Add middleware hooks
    if (target.hooks && typeof target.hooks == 'object') {
        for (let hookType in target.hooks) {
            for (let hookAction in target.hooks[hookType]) {
                let hook = target.hooks[hookType][hookAction];
                let index = hooks.indexOf(hook);
                if (index < 0) {
                    hooks.push(hook);
                    schema[hookType](hookAction, hook);
                }
            }
        }
    }

    // Add static methods
    staticProps.forEach(name => {
        let method = Object.getOwnPropertyDescriptor(target, name);
        if (typeof method.value == 'function') {
            schema.static(name, method.value);
        } else if (typeof method.get == 'function') {
            schema.static(name, method.get);
        }

    });

    // Add methods and virtual
    instanceProps.forEach(name => {
        let method = Object.getOwnPropertyDescriptor(proto, name);
        if (typeof method.get == 'function') schema.virtual(name).get(method.get);
        if (typeof method.set == 'function') schema.virtual(name).set(method.set);
        if (typeof method.value == 'function') {
            let x = /^(get|set)_(.+)$/.exec(name);
            if (x && x[1]) {
                switch (x[1]) {
                    case 'get':
                        schema.path(x[2]).get(method.value);
                        break;
                    case 'set':
                        schema.path(x[2]).set(method.value);
                        break;
                }
            } else {
                schema.method(name, method.value);
            }
        }
    });
}
