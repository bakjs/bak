const Model = require('../../mongoose/model');
const {Schema} = require('mongoose');

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
                    _agent: {type: String},
                    _ip: {type: String},
                    _client: {type: Schema.Types.ObjectId},
                    created_at: {type: Date, default: Date.now}
                }
            ]
        };
    }

    get is_disabled() {
        return this.get('enabled') === false || this.get('blocked') === true
    }

    afterLogin({request,session}) {

    }

    afterLogout({request,session}) {

    }

}

module.exports = User;
