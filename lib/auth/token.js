const Boom = require('boom');
const Hoek = require('hoek');
const Joi = require('joi');
const {jwt_verify, jwt_decode} = require('../helpers/security');

// Based on https://github.com/johnbrett/hapi-auth-bearer-token (MIT)

const defaults = {
    accessTokenName: 'token',
    allowQueryToken: true,
    allowCookieToken: true,
    tokenType: 'Bearer',
};

const schema = Joi.object().keys({
    accessTokenName: Joi.string().required(),
    allowQueryToken: Joi.boolean(),
    allowCookieToken: Joi.boolean(),
    tokenType: Joi.string().required(),
}).unknown(true);

const plugin = (server, auth_options) => {

    Hoek.assert(auth_options, 'Missing bearer auth strategy auth_options');

    const settings = Hoek.applyToDefaults(defaults, auth_options);

    Joi.assert(settings, schema);

    const validate = (token, session, user) => {
        return jwt_verify(token, auth_options.secret);
    };

    const auth = async (token) => {
        let token_decoded = jwt_decode(token);
        if (!token_decoded) throw {error: 'INVALID_TOKEN'};

        let user_id = token_decoded.u;
        let session_id = token_decoded.s;

        // Find user
        let user = await auth_options.user_model.findById(user_id);
        if (!user) {
            throw {error: 'USER_NOT_FOUND'};
        }

        // Check if user disabled
        if (user.is_disabled()) {
            throw {error: 'USER_DISABLED'};
        }

        // Find session
        let session = user.sessions.id(session_id);
        if (!session) {
            throw {error: 'SESSION_EXPIRED'};
        }

        // Validate token
        let validate_fn = auth_options.validate || validate;
        let validated = await validate_fn(token, session, user, () => validate(token, session, user));

        if (!validated) {
            throw {error: 'INVALID_TOKEN'};
        }

        return {
            credentials: {user},
            artifacts: session
        };
    };

    const authenticate = (request, reply) => {
        try {
            // Use headers by default
            let authorization = request.raw.req.headers.authorization;

            // Fallback 1 : Check for cookies
            if (settings.allowCookieToken
                && !authorization
                && request.state[settings.accessTokenName]) {
                authorization = settings.tokenType + ' ' + request.state[settings.accessTokenName];
            }

            // Fallback 2 : URL Query
            if (settings.allowQueryToken
                && !authorization
                && request.query[settings.accessTokenName]) {
                authorization = settings.tokenType + ' ' + request.query[settings.accessTokenName];
                delete request.query[settings.accessTokenName];
            }

            // Fallback 3 : Throw Error
            if (!authorization) {
                return reply(Boom.unauthorized(null, settings.tokenType));
            }

            // Try to parse headers
            const parts = authorization.split(/\s+/);

            // Ensure correct token type
            if (parts[0].toLowerCase() !== settings.tokenType.toLowerCase()) {
                return reply(Boom.unauthorized(null, settings.tokenType));
            }

            // Validate token
            const token = parts[1];

            auth(token).then(({credentials, artifacts}) => {
                reply.continue({credentials, artifacts});
            }).catch(err => {
                reply(Boom.unauthorized(err.error));
            });

        } catch (e) {
            reply(Boom.internal("AUTH_ERROR"));
        }
    };

    return {authenticate};
};

module.exports = plugin;