const Mongoose =require('./mongoose');

const MongoosePlugin = {
    register: function (server, config, next) {

        if (global.mongo) {
            console.warn('[Mongo] Plugins seems to be already registered, this may cause troubles!')
        } else {
            global.mongo = {
                connections: [],
            }
        }

        let queue = Object.keys(config.connections).map(database => new Promise((resolve, reject) => {
            let connection_conf = config.connections[database];
            let connection;

            if (database !== 'default') {
                connection = Mongoose.createConnection(connection_conf.uri);
            } else {
                connection = Mongoose.connect(connection_conf.uri);
            }

            global.mongo.connections[database] = connection;
            resolve();
        }));

        Promise.all(queue).then(()=>{
            next();
        });
    }
};

MongoosePlugin.register.attributes = {
    pkg: {
        name: 'bak-mongoose',
    }
};

module.exports = MongoosePlugin;