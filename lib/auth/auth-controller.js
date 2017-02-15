const Boom = require('boom');
const Controller = require('../controller');

class AuthController extends Controller {

    constructor(auth) {
        super({
            prefix: '/api',
            default: {
                auth: false,
            },
            routes: {
                auth_user: {
                    auth: {mode: 'required'},
                },
                auth_logout: {
                    auth: {mode: 'required'},
                },
            }
        });

        /** @type Auth */
        this.auth = auth;
    }

    async auth_login_post(request, reply) {
        let {username, password} = request.payload;

        let {id_token} = await this.auth.login({username, password, request});

        reply({id_token});
    }

    async auth_logout(request, reply) {
        let {session, user} = request;
        await user.logout(session);
        reply('LOGGED_OUT');
    }

    async auth_user(request, reply) {
        reply({user: request.user});
    }

    async oauth_$clientID_login(request, reply, {clientID}) {
        let redirect_uri = await this.auth.oauth_login(clientID);

        reply.redirect(redirect_uri);
    }

    async oauth_$clientID_authorize(request, reply, {clientID}) {
        let redirect_uri = await this.auth.oauth_authorize(clientID, request);

        reply({redirect_uri});
    }


}

module.exports = AuthController;