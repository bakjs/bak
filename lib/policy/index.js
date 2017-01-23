const Boom = require('boom');

exports.register = function (server, options, next) {
    if (!options) options = {};

    server.ext('onPreHandler', ((request, reply) => {
        let route_policy = request.route.settings.plugins.policy;
        let user = request.auth.credentials;

        if (route_policy && route_policy(user, request))
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
