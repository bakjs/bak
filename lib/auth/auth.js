const Boom = require('boom');
const Axios = require('axios');
const {hash_verify, jwt_sign, uid} = require('../helpers/security');
const {realIP} = require('../helpers');
const _ = require('lodash');

class Auth {

    constructor(auth_options = {}, server) {
        this.auth_options = auth_options;

        // Oauth clients
        if (!this.auth_options.oauth) {
            this.auth_options.oauth = {};
        }

        // Expose Methods to server
        this.expose(server);
    }

    expose(server) {
        const self = this;

        server.decorate('request', 'login', function login({username, password}) {
            return self.login({request: this, username, password});
        });

        server.decorate('request', 'get_token', function get_token(user) {
            return self.get_token(user, this);
        });
    }

    async get_token(user, request = {headers: [], info: []}, client) {
        // Create new session
        let session = user.sessions.create({
            agent: request.headers['user-agent'],
            ip: realIP(request)
        });

        // Revoke any older sessions of user with same user-agent and ip
        if (this.auth_options.auto_logout === true) {
            user.sessions = user.sessions.filter(s => (s.agent !== session.agent || s.ip !== session.ip));
        }

        // Apply max sessions
        let {max_sessions} = this.auth_options;
        if (max_sessions !== false) {
            max_sessions = max_sessions || 3;
            user.sessions = _.sortBy(user.sessions, ['created_at', '_id']).reverse().slice(0, max_sessions - 1);
        }

        // Add new session
        user.sessions.unshift(session);
        await user.save();

        // Sign session token
        let secret = client ? client.secret : this.auth_options.secret;
        return await jwt_sign({u: user._id, s: session._id}, secret);
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

        if (!user) {
            throw Boom.unauthorized('USER_NOT_FOUND')
        }

        // Check password
        let verified = await hash_verify(password, user.get('password'));
        if (verified !== true) {
            throw Boom.unauthorized('INVALID_PASSWORD')
        }

        // Issue token
        let id_token = await this.get_token(user, request);

        return {id_token, user};
    }

    // ==============================
    // Oauth Client
    // ==============================

    async oauth_login(client_id) {
        // Find client
        let client = this.auth_options.oauth[client_id];
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

    async oauth_authorize(client_id, request) {
        // Request params
        let {code, state} = request.query;

        // Find client
        let client = this.auth_options.oauth[client_id];
        if (!client) {
            throw Boom.notFound();
        }

        // Request for access_token
        let url = `${client.url}/access_token`;

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
            user = (await Axios.get(`${client.url}/user?token=${access_token}`)).data.user;
        } catch (e) {

        }

        if (!user || !user.email) {
            throw Boom.unauthorized("OAUTH_INVALID_USER")
        }

        // Find or update local user record
        let local_user = await this.auth_options.user_model.findOne({
            email: user.email
        });

        if (!local_user) {
            // Create local user if not found
            local_user = new this.auth_options.user_model(user);

        } else {
            // Update only fields not already filled
            Object.keys(user).forEach(key => {
                if (!local_user.get(key)) {
                    local_user.set(key, user[key]);
                }
            })
        }

        // Save changes
        await local_user.save();

        // Issue new token
        return this.get_token(local_user, request);
    }

}

module.exports = Auth;