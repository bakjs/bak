const Boom = require('boom');
const Controller = require('../../controller');
const {Issuer} = require('openid-client');
const User = require('../models/user');
const {hash_verify, jwt_sign} = require('../../helpers/security');
const Sharp = require('../../sharp');
const {upload} = require('../../minio');

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

        // this.auth_options = auth_options;
        // if (this.auth_options.client)
        //     this.init_client().catch(e => {
        //         if (e) console.error(e);
        //     });
    }

    // async _init_client() {
    //     const issuer = await Issuer.discover(this.auth_options.client.discover_url);
    //     this.client = new issuer.Client(this.auth_options.client);
    // }

    async login_post(request, reply, _user) {
        let {username, password} = request.payload;

        // Prefix username
        if (this.auth_options.username_prefix &&
            username.indexOf(this.auth_options.username_prefix) === -1)
            username += this.auth_options.username_prefix;

        // Find user
        let user = await (User.findOne({email: username}));
        if (!user) return reply(Boom.unauthorized("User not found"));

        // Check password
        let verified = await hash_verify(password, user.get('password'));
        if (verified !== true) return reply(Boom.unauthorized("Invalid credentials"));

        // Sign token
        let id_token = await jwt_sign({s: user._id}, this.auth_options.client.client_secret);

        return reply({id_token});
    }

    oauth_login(request, reply, user) {
        if (!this.client) return reply(Boom.serverUnavailable("oauth"));

        let opts = {
            redirect_uri: this.auth_options.redirect_uri,
            scope: 'profile email phone'
        };

        reply(this.client.authorizationPost(opts));
    }

    async oauth_callback(request, reply, user) {
        if (!this.client) return reply(Boom.serverUnavailable("oauth"));

        console.log("Callback");
        let tokenSet = await this.client.authorizationCallback(this.auth_options.redirect_uri, request.query);
        console.log('received and validated tokens %j', tokenSet);
        console.log('validated id_token claims %j', tokenSet.claims);

        reply(this.client.authorizationPost(opts));
    }

    async profile(request, reply, user) {
        reply({
            profile: request.auth.credentials
        });
    }

    async profile_post(request, reply, user) {

        // Upload profile photo
        let avatar = request.payload.avatar;

        if (avatar instanceof Buffer) {
            let img = await Sharp(avatar).resize(128, 128).webp({quality: 100}).toBuffer();
            console.log("Uploading avatar for " + user._id);
            user.avatar_etag = await upload('avatar', user._id + '.webp', img);
            await user.save();
            console.log("Upload done!");
        }

        reply({user});
    }


}

module.exports = AuthController;