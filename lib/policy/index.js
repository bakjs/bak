const Boom = require('boom');
const Policy = require('./policy');

exports.register = function (server, options, next) {
    if (!options) options = {};

    let policy = new Policy(options.policies);

    server.ext('onPreHandler', ((request, reply) => {
        let route_policy = request.route.settings.plugins.policy;
        let user = request.auth.credentials;

        if (route_policy && !policy.can(user, route_policy))
            return reply(Boom.unauthorized(route_policy));

        return reply.continue();
    }));

    next();
};

exports.register.attributes = {
    pkg: {
        name: 'bak-policy'
    }
};
