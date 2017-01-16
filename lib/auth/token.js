const Boom = require('boom');
const Hoek = require('hoek');
const Joi = require('joi');
const {jwt_verify} = require('../helpers/security');

// Based on https://github.com/johnbrett/hapi-auth-bearer-token (MIT)

const defaults = {
    accessTokenName: 'token',
    allowQueryToken: true,
    allowCookieToken: true,
    tokenType: 'Bearer',
    client_id: 'default',
    client_secret: 'default',
    connection: 'default',
};

const schema = Joi.object().keys({
    accessTokenName: Joi.string().required(),
    allowQueryToken: Joi.boolean(),
    allowCookieToken: Joi.boolean(),
    tokenType: Joi.string().required(),
    client_id: Joi.string(),
    client_secret: Joi.string(),
    connection: Joi.string(),
}).unknown(true);

const plugin = (server, auth_options) => {

    Hoek.assert(auth_options, 'Missing bearer auth strategy auth_options');

    const settings = Hoek.applyToDefaults(defaults, auth_options);

    Joi.assert(settings, schema);

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

            // Now use token
            const token = parts[1];
            jwt_verify(token, auth_options.secret).then((token_decoded) => {
                // Verify token is valid
                if (!token_decoded) return reply(Boom.unauthorized('Invalid token'));

                let user_id = token_decoded.u;
                let session_id = token_decoded.s;

                auth_options.user_model.findById(user_id).then((user) => {
                    let session = user.sessions.id(session_id);
                    if (!session) {
                        return reply(Boom.unauthorized("Session expired"));
                    }
                    reply.continue({
                        credentials: user,
                        artifacts: session,
                    });
                }).catch((err) => {
                    console.error(err);
                    return reply(Boom.unauthorized('User not found'));
                });

            }).catch((err) => {
                console.error(err);
                return reply(Boom.unauthorized('Manipulated token'));
            });
        } catch (e) {
            console.error(e);
            reply(Boom.unauthorized("General error while authenticating"));
        }
    };

    return {authenticate};
};

module.exports = plugin;