const Boom = require('boom');
const Axios = require('axios');
const _ = require('lodash');
const { Utils } = require('bak')
const AuthBaseProvider = require('./base');

const { jwt_verify, jwt_decode, hash_verify, jwt_sign, uid  } = Utils.security
const { realIP } = Utils

class AuthDefaultProvider extends AuthBaseProvider {

    constructor(options = {}) {
        super(options);

        // User Model
        if (!this.options.user_model) {
            this.options.user_model = require('./user').$model;
        }
    }

    // ==============================
    // Authentication methods
    // ==============================
    async authToken(token) {
        let token_decoded = jwt_decode(token);
        if (!token_decoded) throw { error: 'INVALID_TOKEN' };

        let user_id = token_decoded.u;
        let session_id = token_decoded.s;

        // Find user
        let user = await this.options.user_model.findById(user_id);
        if (!user) {
            throw { error: 'USER_NOT_FOUND' };
        }

        // Check if user disabled
        if (user.is_disabled) {
            throw { error: 'USER_DISABLED' };
        }

        // Find session
        let session = user.sessions.id(session_id);
        if (!session) {
            throw { error: 'SESSION_EXPIRED' };
        }

        // Validate token
        let validated = await this.validateToken(token, session, user);

        if (!validated) {
            throw { error: 'INVALID_TOKEN' };
        }

        return {
            credentials: { user, scope: user.scope },
            artifacts: session,
        };
    }

    validateToken(token) {
        return jwt_verify(token, this.options.secret);
    }

    // ==============================
    // Create Token & Session
    // ==============================
    async getToken(user, request = { headers: [], info: [] }, client) {
        // Create new session
        let session = user.sessions.create({
            agent: request.headers['user-agent'],
            ip: realIP(request)
        });

        // Revoke any older sessions of user with same user-agent and ip
        if (this.options.auto_logout === true) {
            user.sessions = user.sessions.filter(s => (s.agent !== session.agent || s.ip !== session.ip));
        }

        // Apply max sessions
        let { max_sessions } = this.options;
        if (max_sessions !== false) {
            max_sessions = max_sessions || 3;
            user.sessions = _.sortBy(user.sessions, ['created_at', '_id']).reverse().slice(0, max_sessions - 1);
        }

        // Add new session
        user.sessions.unshift(session);
        await user.save();

        // Notify user model
        user.afterLogin({ request, session });

        // Sign session token
        let secret = client ? client.secret : this.options.secret;
        let token = await jwt_sign({ u: user._id, s: session._id }, secret);
        return { session, token };
    }

    // ==============================
    // Methods to work with user
    // ==============================
    findByUsername(username) {
        let username_fields = this.options.username_fields || ['username', 'email'];

        return this.options.user_model.findOne({
            $or: username_fields.map((field) => {
                let obj = {};
                obj[field] = username;
                return obj;
            })
        });
    }

    validateUser(user) {
        // Check user is not null!
        if (!user) {
            throw Boom.unauthorized('USER_NOT_FOUND')
        }

        // Check if user disabled
        if (user.is_disabled) {
            throw Boom.unauthorized('USER_DISABLED');
        }
    }

    async validatePassword(user, password) {
        // Check password
        let verified = await hash_verify(password, user.get('password'));
        if (verified !== true) {
            throw Boom.unauthorized('INVALID_PASSWORD')
        }
    }

    // ==============================
    // Login/Logout
    // ==============================
    get loginSupported() {
        return true;
    }

    async login({ username, password, request }) {
        // Find user
        let user = await this.findByUsername(username);

        // Validate user
        await this.validateUser(user);

        // Validate password
        await this.validatePassword(user, password);

        // Issue token
        const { token } = await this.getToken(user, request);

        return { token, user };
    }

    logout({ user, session, request }) {
        if (session) user.sessions.remove(session);
        else user.sessions = [];

        // Notify user model
        user.afterLogout({ session, request });

        return user.save()
    }

    // ==============================
    // Oauth Client
    // ==============================
    get oauthSupported() {
        return this.options.oauth;
    }

    async oauthLogin(client_id) {
        // Find client
        let client = this.options.oauth[client_id];
        if (!client) {
            throw Boom.notFound();
        }

        // Scopes
        let scope = client.scope || ['oauth'];
        if (Array.isArray(scope)) {
            scope = scope.join(',');
        }

        // State
        // An unguessable random string. It is used to protect against CSRF attacks.
        let state = await uid(6);

        // Generate url
        return `${client.url}/authorize?` +
            `state=${encodeURIComponent(state)}` +
            `&client_id=${encodeURIComponent(client.client_id)}` +
            `&scope=${encodeURIComponent(scope)}` +
            `&redirect_uri=${encodeURIComponent(client.redirect_uri)}`
            ;
    }

    async oauthAuthorize(client_id, request) {
        // Request params
        let { code, state } = request.payload || request.query;

        // Find client
        let client = this.options.oauth[client_id];
        if (!client) {
            throw Boom.notFound();
        }

        // Request for access_token
        let url = `${client.url_internal || client.url}/access_token`;

        let data = {
            code: code,
            state: state,
            client_id: client.client_id,
            client_secret: client.client_secret,
        };

        let access_token;

        try {
            let res = (await Axios.post(url, data)).data || {};
            access_token = res.access_token;
        } catch (e) {
            throw Boom.unauthorized((e.response && e.response.data) ? e.response.data.message : '');
        }

        if (!access_token || access_token === '') {
            throw Boom.unauthorized("OAUTH_NO_TOKEN")
        }

        // Get user profile
        let user;

        try {
            user = (await Axios.get(`${client.url_internal || client.url}/user?token=${access_token}`)).data.user;
        } catch (e) {

        }

        if (!user || !user.email) {
            throw Boom.unauthorized("OAUTH_INVALID_USER")
        }

        // Change _id to id
        user.id = user._id;
        delete user._id;

        // Find or update local user record
        let local_user = await this.options.user_model.findOne({ id: user.id });

        if (!local_user) {
            // Create local user if not found
            local_user = new this.options.user_model(user);
        } else {
            // Update exiting user
            Object.keys(user).forEach(key => {
                local_user.set(key, user[key]);
            })
        }

        // Save changes
        await local_user.save();

        // Issue new token
        let { token } = await this.getToken(local_user, request);

        return { token, user };
    }

}

module.exports = AuthDefaultProvider;