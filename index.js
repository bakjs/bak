const path = require('path');
require('./helpers/colors');

function init(config) {
    const CLI = require('./modules/cli');
    const Server = require('./modules/server');
    let cmd = process.argv[2];

    switch (cmd) {
        // CLI
        case 'run':
            let cli = new CLI(config);
            global.app = cli;
            cli.init().then(app => {
                require(path.resolve(process.cwd(), process.argv[3]));
            }).catch(error);
            break;

        // REPL
        case 'repl':
            let cli2 = new CLI(config);
            global.app = cli2;
            cli2.init().then(app => {
                let repl = require("repl");
                repl.start({
                    prompt: "hapi> ",
                    useGlobal: true,
                });
            }).catch(error);
            break;

        // Server
        default:
            // Start Server
            let server = new Server(config);
            global.app = server;
            server.init().then(app => {
                console.log(`Server running at: ${app.server.info.uri}`);
            }).catch(error);
    }
}
module.exports = init;

function error(err) {
    console.error(err);
    process.exit(1);
}
