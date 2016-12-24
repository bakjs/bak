import Mongoose from './index';

const HapiMongoosePlugin = {
    register: function (server, config, next) {

        if (global.mongo) {
            console.warn('[Mongo] Plugins seems to be already registred, this may cause troubles!')
        } else {
            global.mongo = {
                connections: [],
            }
        }


        let p = Object.keys(config.connections).map(database => new Promise(async(resolve, reject) => {
            let connection_conf = config.connections[database];
            try {
                let connection = Mongoose.createConnection(connection_conf.uri);
                global.mongo.connections[database] = connection;
                resolve(connection);
            } catch (e) {
                reject(`[Mongo] Cannot connect to ${database} : ${e}`);
            }
        }));

        Promise.all(p).then(() => {
            next();
        });
    }
};

HapiMongoosePlugin.register.attributes = {
    pkg: {
        name: 'mongo',
        version: '0.0.0'
    }
};

module.exports = HapiMongoosePlugin;