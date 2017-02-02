const Model = require('../mongoose/model');

class User extends Model {

    static get $options() {
        return {strict: false};
    };

    static get $visible() {
        return ['_id', 'name', 'username', 'email', 'avatar'];
    }

    static get $schema() {
        return {
            username: {type: String, index: true, sparse: true, unique: true},
            email: {type: String, index: true, sparse: true, unique: true},
            password: {type: String},
            avatar_etag: {type: String},
            name: {type: String},
            is_banned: {type: Boolean},
            meta: {type: Object},
            roles: {type: Array},
            sessions: [
                {
                    agent: {type: String},
                    ip: {type: String}
                }
            ]
        };
    }

    async logout(session) {
        if (session) this.sessions.remove(session);
        else this.sessions = [];

        return this.save()
    }

}

module.exports = User;
