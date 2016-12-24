const PM2 = require('pm2').custom;
const Log = require('pm2/lib/API/Log');

module.exports = function (config) {
    let pm2 = new PM2({daemon_mode: false});


    config = Object.assign({}, config, {
        exec_mode: "cluster",
        instances: 1,
        max_restarts: 1,
        env_production: {
            NODE_ENV: "production"
        }
    });

    pm2.start(config);
    Log.devStream(pm2.Client, 'all');
};
