const Boom = require('boom');
const Controller = require('../../controller');
// const {Issuer} = require('openid-client');
const User = require('../models/user');
const {hash_verify, jwt_sign} = require('../../helpers/security');
const Sharp = require('../../../vendor/sharp');
const {upload} = require('../../../vendor/minio');

class AuthController extends Controller {

    constructor(auth_options) {
        super({
            prefix: '/api/auth',
            routes: {
                profile_post: {
                    auth: {mode: 'required'},
                    payload: {
                        maxBytes: 1048576 * 16,
                    }
                },
                profile: {
                    auth: {mode: 'required'}
                }
            }
        });

        this.auth_options = auth_options;

        // this._init_oauth_client();
    }

    async login_post(request, reply, _user) {
        let {username, password} = request.payload;

        // Prefix username
        if (this.auth_options.username_prefix &&
            username.indexOf(this.auth_options.username_prefix) === -1)
            username += this.auth_options.username_prefix;

        // Find user
        let user = await User.findOne({email: username});
        if (!user) return reply(Boom.unauthorized("User not found"));

        // Check password
        let verified = await hash_verify(password, user.get('password'));
        if (verified !== true) return reply(Boom.unauthorized("Invalid credentials"));

        // Create new session
        let session = user.sessions.create({
            agent: request.headers['user-agent'],
            ip: request.info['remoteAddress']
        });

        // Revoke any older sessions of user with same user-agent
        user.sessions = user.sessions.filter(s => (s.agent != session.agent));

        // Add new session
        user.sessions.push(session);
        await user.save();

        // Sign session token
        let id_token = await jwt_sign({u: user._id, s: session._id}, this.auth_options.secret);

        return reply({id_token});
    }


    profile(request, reply, user) {
        reply({user});
    }

    async profile_post(request, reply, user) {
        // Upload profile photo
        let avatar = request.payload.avatar;

        if (avatar instanceof Buffer) {
            try {
                let img = await Sharp(avatar).resize(128, 128).webp({quality: 100}).toBuffer();
                user.avatar_etag = await upload('avatar', user._id + '.webp', img);
                await user.save();
            } catch (e) {
                return reply(Boom.badRequest("Error while uploading avatar"));
            }
        }

        reply({user});
    }

    // ==============================
    // OpenId Client functionality
    // ==============================
    // init_oauth_client() {
    //     // if (this.auth_options.client) {
    //     // const issuer = await Issuer.discover(this.auth_options.client.discover_url);
    //     // this.client = new issuer.Client(this.auth_options.client);
    //     // }
    // }
    //
    // oauth_login(request, reply, user) {
    //     if (!this.client) return reply(Boom.serverUnavailable("oauth"));
    //
    //     let opts = {
    //         redirect_uri: this.auth_options.redirect_uri,
    //         scope: 'profile email phone'
    //     };
    //
    //     reply(this.client.authorizationPost(opts));
    // }
    //
    // async oauth_callback(request, reply, user) {
    //     if (!this.client) return reply(Boom.serverUnavailable("oauth"));
    //
    //     console.log("Callback");
    //     let tokenSet = await this.client.authorizationCallback(this.auth_options.redirect_uri, request.query);
    //     console.log('received and validated tokens %j', tokenSet);
    //     console.log('validated id_token claims %j', tokenSet.claims);
    //
    //     reply(this.client.authorizationPost(opts));
    // }

}

module.exports = AuthController;