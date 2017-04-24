const AuthController = require('./controller');
const AuthTokenPlugin = require('./token');

exports.register = (server, options, next) => {

    // 1- Auth Handler

    // Token Based Auth Strategy
    server.auth.scheme('bak', AuthTokenPlugin);

    // Register as default strategy
    server.auth.strategy('auth', 'bak', 'optional', options);

    // 2- Auth Provider

    // Create Auth provider instance
    const Provider = options.provider || require('./provider');
    let auth = new Provider(options, server);

    // 3- API Routes

    // Register Auth Controller
    const authController = new AuthController(auth, server);
    authController.hapi = server;
    server.route(authController.routes());

    // 4- HAPI Stuff

    // Expose provider to plugin
    server.expose('auth', auth);

    // Next
    next();
};

exports.register.attributes = {
    name: 'bak-auth',
};