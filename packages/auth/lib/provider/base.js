const Boom = require('boom');

class AuthBaseProvider {

    constructor(options = {}) {
        this.options = options;
    }

    // ==============================
    // Authentication methods
    // ==============================
    authToken(token) {
        throw Boom.notImplemented("authToken not implemented");
    }

    // ==============================
    // Create Token & Session
    // ==============================
    getToken(user, request, client) {
        throw Boom.notImplemented("getToken not implemented");
    }

    // ==============================
    // Methods to work with user
    // ==============================
    findByUsername(username) {
        throw Boom.notImplemented("findByUsername not implemented");
    }

    validateUser(user) {
        // Check user is not null!
        if (!user) {
            throw Boom.unauthorized('USER_NOT_FOUND')
        }

        // Check if user disabled
        if (user.is_disabled) {
            throw Boom.unauthorized('USER_DISABLED');
        }
    }

    async validatePassword(user, password) {
        throw Boom.notImplemented("validatePassword not implemented");
    }

    // ==============================
    // Login/Logout
    // ==============================
    get loginSupported() {
        return false;
    }

    login({username, password, request}) {
        throw Boom.notImplemented("login not implemented");
    }

    logout({user, session, request}) {
        throw Boom.notImplemented("logout not implemented");
    }

    // ==============================
    // Oauth Client
    // ==============================
    get oauthSupported() {
        return false;
    }

    oauthLogin(client_id) {
        throw Boom.notImplemented("oauthLogin not implemented");
    }

    oauthAuthorize(client_id, request) {
        throw Boom.notImplemented("oauthAuthorize not implemented");
    }

}

module.exports = AuthBaseProvider;