const Server = require('./server');

class HapiAuthMock {
    scheme() {

    }

    strategy() {

    }
}

class HapiMockServer {

    constructor() {
        this.auth = new HapiAuthMock();
    }

    start(cb) {
        cb();
    }

    route(routes) {
        // STUB
    }

    ext() {
        // STUB
    }

    register({register, options}, cb) {
        register.register(this, options, cb);
    }

}

module.exports = class CLI extends Server {
    _create_server() {
        return new HapiMockServer();
    }

    _start() {
        // STUB
    }

    route() {
        // STUB
    }

};
