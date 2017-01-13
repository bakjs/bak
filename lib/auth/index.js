const AuthController = require('./controller');
const AuthTokenPlugin = require('./token');

exports.register = (server, options, next) => {
    // Define our auth scheme
    server.auth.scheme('bak', AuthTokenPlugin);

    // Register as default strategy
    server.auth.strategy('auth', 'bak', 'optional', options);

    // Register Auth API Routes
    const authController = new AuthController(options);
    server.route(authController.routes());

    // Next
    next();
};

exports.register.attributes = {
    pkg: {
        name: 'bak-auth',
    }
};