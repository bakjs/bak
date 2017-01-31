const {hash_verify, jwt_sign} = require('../helpers/security');

class Auth {

    constructor(auth_options = {}) {
        this.auth_options = auth_options;
    }

    async login({username, password, request}) {
        // Default request
        if (!request) request = {headers: [], info: []};

        // Prefix username
        if (this.auth_options.username_prefix &&
            username.indexOf(this.auth_options.username_prefix) === -1)
            username += this.auth_options.username_prefix;

        // Find user
        let username_field = this.auth_options.username_field || 'email';
        let query = {};
        query[username_field] = username;
        let user = await this.auth_options.user_model.findOne(query);
        if (!user) return {};

        // Check password
        let verified = await hash_verify(password, user.get('password'));
        if (verified !== true) return {};

        // Create new session
        let session = user.sessions.create({
            agent: request.headers['user-agent'],
            ip: request.info['remoteAddress']
        });

        // Revoke any older sessions of user with same user-agent and ip
        user.sessions = user.sessions.filter(s => (s.agent != session.agent /*|| s.ip != session.ip*/));

        // Add new session
        user.sessions.push(session);
        await user.save();

        // Sign session token
        let id_token = await jwt_sign({u: user._id, s: session._id}, this.auth_options.secret);

        return {id_token, user};
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

module.exports = Auth;