const AuthController = require('./controller');
const AuthTokenPlugin = require('./token');
const User = require('./user');

exports.register = (server, options, next) => {

    // Allow set user model
    if (!options.user_model) {
        options.user_model = User.$model;
    }

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