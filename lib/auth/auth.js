const {hash_verify, jwt_sign} = require('../helpers/security');

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

    async login({username, password, request}) {
        // Default request
        if (!request) request = {headers: [], info: []};

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

        // Create new session
        let session = user.sessions.create({
            agent: request.headers['user-agent'],
            ip: request.info['remoteAddress']
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

    // ==============================
    // Oauth Client
    // ==============================


}

module.exports = Auth;