const Model = require('../mongoose/model');
const {Schema} = require('mongoose');
const {url} = require('../../vendor/minio');
const Sharp = require('../../vendor/sharp/index');
const {upload} = require('../../vendor/minio');

class User extends Model {

    static get $options() {
        return {strict: false};
    };

    static get $visible() {
        return ['_id', 'name', 'username', 'email', 'avatar'];
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

    get avatar() {
        if (this.avatar_etag)
            return url('avatars', this._id + '.webp', this.avatar_etag);
    }

    async logout(session) {
        if (session)
            this.sessions.remove(session);
        else
            this.sessions = [];

        return this.save()
    }

    async upload_avatar(avatar){
        if(!avatar instanceof Buffer) return false;

        let img = await Sharp(avatar).resize(128, 128).webp({quality: 100}).toBuffer();
        this.avatar_etag = await upload('avatars', this._id + '.webp', img, 'image/webp');

        return this.save();
    }

}

module.exports = User;
