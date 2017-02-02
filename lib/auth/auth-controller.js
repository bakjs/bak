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

    async login_post(request, reply, _user) {
        let {username, password} = request.payload;

        let {id_token, error} = await this.auth.login({username, password, request});

        if (!id_token || error)return reply(Boom.unauthorized(error));

        reply({id_token});
    }

    async logout(request, reply, user) {
        let session = request.auth.artifacts;
        await user.logout(session);
        reply({status: 'logged out'});
    }

    user(request, reply, user) {
        reply({user});
    }

}

module.exports = AuthController;