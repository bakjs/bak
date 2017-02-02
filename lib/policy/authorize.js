const Boom = require('boom');

exports.register = function (server, options, next) {
    if (!options) options = {};
    const policies = options.policies || [];

    // General check function
    check = async(user, action, target) => {
        if (!user || !action) return false;

        try {
            // Resolve check function
            let check_fn = action;
            if (!(check_fn instanceof Function)) check_fn = policies[action];
            if (!(check_fn instanceof Function)) {
                server.log(['warning', 'authorize'], {message: 'no policy defined for ' + action});
                return false
            }

            // Test against check_fn
            let result = check_fn(user, target);

            // Support async policies
            if (result instanceof Promise) result = await result;

            // ensure result is true or false only
            return !!result;

        } catch (error) {
            // Log and reject unhandled errors
            server.log(['error', 'authorize'], {action, target, error});
            return false;
        }
    };

    // Adds request.can() decorator
    function can(action, target) {
        return check(this.auth.credentials, action, target);
    }

    server.decorate('request', 'can', can);

    // Adds request.authorize() decorator
    async function authorize(action, target) {
        let result = await check(this.auth.credentials, action, target);
        if (result !== true) throw Boom.unauthorized(action);
        return true;
    }

    server.decorate('request', 'authorize', authorize);

    next();
};

exports.register.attributes = {
    name: 'bak-policy-authorize'
};
