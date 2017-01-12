const Boom = require('boom');
const Controller = require('../../controller');
const {Issuer} = require('openid-client');
const User = require('../models/user');
const {hash_verify, jwt_sign} = require('../../helpers/security');
const Sharp = require('../../sharp');
const {upload} = require('../../minio');

class AuthController extends Controller {

    constructor(options) {
        super('/api/auth', {auth: false});
        this.auth_options = options;

        // if (this.auth_options.client)
        //     this.init_client().catch(e => {
        //         if (e) console.error(e);
        //     });


        this.post('/login', this.login);
        this.get('/oauth/login', this.oauth_login);
        this.get('/oauth/callback', this.oauth_callback);
        this.get('/profile', this.profile, {auth: {mode: 'required'}});
        this.post('/profile', this.update_profile, {
            auth: {mode: 'required'},
            payload: {
                maxBytes: 1048576 * 16,
            }
        });

    }

    async init_client() {
        const issuer = await Issuer.discover(this.auth_options.client.discover_url);
        this.client = new issuer.Client(this.auth_options.client);
    }

    async login(request, reply) {
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

    oauth_login(request, reply) {
        if (!this.client) return reply(Boom.serverUnavailable("oauth"));

        let opts = {
            redirect_uri: this.auth_options.redirect_uri,
            scope: 'profile email phone'
        };

        reply(this.client.authorizationPost(opts));
    }

    async oauth_callback(request, reply) {
        if (!this.client) return reply(Boom.serverUnavailable("oauth"));

        console.log("Callback");
        let tokenSet = await this.client.authorizationCallback(this.auth_options.redirect_uri, request.query);
        console.log('received and validated tokens %j', tokenSet);
        console.log('validated id_token claims %j', tokenSet.claims);

        reply(this.client.authorizationPost(opts));
    }

    async profile(request, reply) {
        reply({
            profile: request.auth.credentials
        });
    }

    async update_profile(request, reply) {
        let user = await request.auth.artifacts();

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