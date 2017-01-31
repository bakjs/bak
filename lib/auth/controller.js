const Boom = require('boom');
const Controller = require('../controller');
// const {Issuer} = require('openid-client');

class AuthController extends Controller {

    constructor(auth) {
        super({
            prefix: '/api/auth',
            default: {
                auth: {mode: 'required'},
            },
            routes: {
                user_post: {
                    payload: {
                        maxBytes: 1048576 * 16,
                    }
                },
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

        let {id_token} = await this.auth.login({username, password, request});

        if(!id_token)return reply(Boom.unauthorized());

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

    async user_post(request, reply, user) {
        // Upload profile photo
        let avatar = request.payload.avatar;
        if (avatar) await user.upload_avatar(avatar);
        reply({user});
    }


}

module.exports = AuthController;