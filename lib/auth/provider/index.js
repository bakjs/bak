const Boom = require('boom');
const Axios = require('axios');
const _ = require('lodash');
const {hash_verify, jwt_sign, uid} = require('../../helpers/security');
const {realIP} = require('../../helpers/index');

class AuthProvider {

    constructor(auth_options = {}) {
        this.auth_options = auth_options;

        // User Model
        if (!this.auth_options.user_model) {
            this.auth_options.user_model = require('./user').$model;
        }

        // Oauth clients
        if (!this.auth_options.oauth) {
            this.auth_options.oauth = {};
        }
    }

    // ==============================
    // Create Token & Session
    // ==============================

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

        // Notify user model
        user.afterLogin({request, session});

        // Sign session token
        let secret = client ? client.secret : this.auth_options.secret;
        let token = await jwt_sign({u: user._id, s: session._id}, secret);
        return {session, token};
    }

    // ==============================
    // Methods to work with user
    // ==============================
    findByUsername(username) {
        let username_fields = this.auth_options.username_fields || ['username', 'email'];

        return this.auth_options.user_model.findOne({
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
    // Password Based Login
    // ==============================

    async login({username, password, request}) {
        // Find user
        let user = await this.findByUsername(username);

        // Validate user
        await this.validateUser(user);

        // Validate password
        await this.validatePassword(user, password);

        // Issue token
        const {token} = await this.get_token(user, request);

        return {token, user};
    }

    // ==============================
    // Logout
    // ==============================
    logout({user, session, request}) {
        if (session) user.sessions.remove(session);
        else user.sessions = [];

        // Notify user model
        user.afterLogout({session, request});

        return user.save()
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
        let local_user = await this.auth_options.user_model.findOne({id: user.id});

        if (!local_user) {
            // Create local user if not found
            local_user = new this.auth_options.user_model(user);
        } else {
            // Update exiting user
            Object.keys(user).forEach(key => {
                local_user.set(key, user[key]);
            })
        }

        // Save changes
        await local_user.save();

        // Issue new token
        let {token} = await this.get_token(local_user, request);

        return {token, user};
    }

}

module.exports = AuthProvider;