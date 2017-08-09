const Mongoose = require('mongoose');

const MongoosePlugin = {
    register: function (server, config, next) {

        // Use native promises
        Mongoose.Promise = global.Promise;

        // Register mongoose-fill
        // @see https://github.com/whitecolor/mongoose-fill
        if (config.fill !== false) {
            // She will register itself!!
            require('mongoose-fill');
        }

        // Use custom function to log collection methods + arguments
        Mongoose.set('debug', config.debug);

        // Register cachegoose
        // @see https://github.com/boblauer/cachegoose
        if (config.cache !== false) {
            // Require only when needed
            const cachegoose = require('cachegoose');
            cachegoose(Mongoose, config.cache);
        }

        let queue = Object.keys(config.connections).map(connection_name => {
            const connection = config.connections[connection_name];

            const clientOptions = {
                useMongoClient: true
            }

            if (connection_name === 'default') {
                return Mongoose.connect(connection.uri, clientOptions);
            }
            return Mongoose.createConnection(connection.uri, clientOptions);
        });

        Promise.all(queue).then(() => {
            next();
        }).catch((e) => {
            console.log(e);
        });
    }
};

MongoosePlugin.register.attributes = {
    name: 'bak-mongoose',
};

module.exports = MongoosePlugin;
