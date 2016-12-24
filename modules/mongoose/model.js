import Mongoose from './index';

class MongooseModel {

    static get $model() {
        // Prefer cache
        if (this.$model_cached) return this.$model_cached;

        // Get props
        let _schema = this.$schema || {};
        let _connection = this.$connection || Mongoose;
        let _name = this.$name || this.name;
        let _collection = this.$collection;
        let _options = Object.assign({}, this.$options, {
            toObject: {
                virtuals: true,
                getters: true,
                transform: MongooseModel.$transform.bind(this),
            },
            toJSON: {
                virtuals: true,
                getters: true,
                transform: MongooseModel.$transform.bind(this),
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
        schema.plugin(MongooseModel.$wrap, this);

        // Create and return a mongoose model using connection
        let model = _connection.model(_name, schema, _collection/*optional*/, false/*skipInit*/);
        model.$schema = schema;

        return this.$model_cached = model;
    }

    static $transform(doc, ret, options) {
        if (this.$hidden) {
            this.$hidden.forEach(function (prop) {
                delete ret[prop];
            });
        }
        return ret;
    }

    static $wrap(schema, target, hooks = []) {
        // Based on https://github.com/aksyonov/mongoose-class-wrapper/blob/master/src/index.js

        let proto = target.prototype;
        let parent = Object.getPrototypeOf(target);
        let staticProps = Object.getOwnPropertyNames(target);
        let prototypeProps = Object.getOwnPropertyNames(proto);
        let instanceProps = prototypeProps.filter(name => name !== 'constructor');

        // Wrap parent first
        if (parent.name) MongooseModel.$wrap(schema, parent, hooks);

        // Add model schema
        // if (target.schema && typeof target.schema == 'object') {
        //     schema.add(target.schema);
        // }

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
            if (typeof method.value == 'function') schema.static(name, method.value);
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
}

module.exports = MongooseModel;

