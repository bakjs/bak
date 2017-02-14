const {hash_verify, jwt_sign} = require('../helpers/security');
const {realIP} = require('../helpers');

class Auth {

    constructor(auth_options = {}, server) {
        this.auth_options = auth_options;

        // Expose Methods to server
        this.expose(server);
    }

    expose(server) {
        const self = this;
        server.decorate('request', 'login', function login({username, password}) {
            return self.login({request: this, username, password});
        });
    }

    async _get_token(user, request = {headers: [], info: []}) {
        // Create new session
        let session = user.sessions.create({
            agent: request.headers['user-agent'],
            ip: realIP(request)
        });

        // Revoke any older sessions of user with same user-agent and ip
        if (this.auth_options.auto_revoke === true) {
            user.sessions = user.sessions.filter(s => (s.agent !== session.agent || s.ip !== session.ip));
        }

        // Add new session
        user.sessions.push(session);
        await user.save();

        // Sign session token
        let id_token = await jwt_sign({u: user._id, s: session._id}, this.auth_options.secret);

        return {id_token, user};
    }

    async login({username, password, request}) {
        // Prefix username
        if (this.auth_options.username_prefix && username.indexOf('@') === -1)
            username += this.auth_options.username_prefix;

        // Find user
        let username_fields = this.auth_options.username_fields || ['username', 'email'];

        let user = await this.auth_options.user_model.findOne({
            $or: username_fields.map((field) => {
                let obj = {};
                obj[field] = username;
                return obj;
            })
        });

        if (!user) return {error: 'USER_NOT_FOUND'};

        // Check password
        let verified = await hash_verify(password, user.get('password'));
        if (verified !== true) return {error: 'INVALID_PASSWORD'};

        // Issue token
        return this._get_token(user, request);
    }

    // ==============================
    // Oauth Client
    // ==============================


}

module.exports = Auth;