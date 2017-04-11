const Model = require('../mongoose/model');
const {Schema} = require('mongoose');

class User extends Model {

    static get $options() {
        return {
            strict: false,
            timestamps: false // We don't need updated_at
        };
    };

    static get $schema() {
        return {
            // Request User
            user: {type: Schema.Types.ObjectId, ref: 'User', index: true},

            // Request IP
            ip: {type: String},

            // Target ObjectId
            target: {type: Schema.Types.ObjectId, index: true},

            // Target Model
            target_model: {type: String, index: true},

            // Action const
            action: {type: String, index: true},

            // Payload is arbitrary attached data
            payload: {type: Schema.Types.Mixed},

            // Log Entry Create Time
            created_at: {type: Date, default: Date.now}
        };
    }

}

module.exports = User;
