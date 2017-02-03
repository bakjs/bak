const AuthController = require('./auth-controller');
const AuthTokenPlugin = require('./token');
const User = require('./user');
const Auth = require('./auth');

exports.register = (server, options, next) => {

    // Allow set user model
    if (!options.user_model) {
        options.user_model = User.$model;
    }

    // Define our auth scheme
    server.auth.scheme('bak', AuthTokenPlugin);

    // Register as default strategy
    server.auth.strategy('auth', 'bak', 'optional', options);

    // Create auth instance
    let auth = new Auth(options, server);

    // Register Auth API Routes
    const authController = new AuthController(auth, server);
    authController.hapi = server;

    server.route(authController.routes());

    // Next
    next();
};

exports.register.attributes = {
    name: 'bak-auth',
};