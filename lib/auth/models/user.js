const Model = require('../../mongoose/model');
const {Schema} = require('mongoose');

class User extends Model {

    static get $options() {
        return {strict: false};
    };

    static get $hidden() {
        return ['password', 'sessions', 'roles', 'is_banned', 'meta', 'avatar_etag'];
    };

    static get $schema() {
        return {
            username: {type: String, index: true, sparse: true},
            email: {type: String, index: true, sparse: true},
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
    };

    static $wrap_schema(schema) {
        // We don't need this index as access_token already contains user_id
        // schema.index('sessions._id');
    }

}

module.exports = User.$model;
