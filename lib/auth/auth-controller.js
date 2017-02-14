const Boom = require('boom');
const Controller = require('../controller');

class AuthController extends Controller {

    constructor(auth) {
        super({
            prefix: '/api/auth',
            default: {
                auth: {mode: 'required'},
            },
            routes: {
                login_post: {
                    auth: false
                }
            }
        });

        /** @type Auth */
        this.auth = auth;
    }

    async login_post(request, reply) {
        let {username, password} = request.payload;

        let {id_token, error} = await this.auth.login({username, password, request});

        if (!id_token || error) {
            return reply(Boom.unauthorized(error));
        }

        reply({id_token});
    }

    async logout(request, reply) {
        let {session, user} = request;
        await user.logout(session);
        reply('LOGGED_OUT');
    }

    user(request, reply) {
        reply({user: request.user});
    }

}

module.exports = AuthController;