import Config from 'config';
import JWT2 from 'hapi-auth-jwt2'

// ============================================================================
// Hapi JWT2 Plugin
// ============================================================================

function next({resolve, reject, server, options}) {
    server.auth.strategy('jwt', 'jwt', {
        key: options.key,
        validateFunc: (cb) => cb(true),
        verifyOptions: {algorithms: ['HS256']}
    });
    server.auth.default('jwt');
    resolve();
}

const HapiJWT2PluginFactory = function (options) {
    return {
        register: JWT2,
        options,
        next: next,
    }
};

HapiJWT2PluginFactory.attributes = JWT2.register.attributes;

// ============================================================================
// Module Exports
// ============================================================================

module.exports = {
    plugin: HapiJWT2PluginFactory,
};
