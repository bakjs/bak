const { Model, Schema } = require('@bakjs/mongo')

class Audit extends Model {
  static get $options () {
    return {
      strict: false,
      timestamps: false // We don't need updated_at
    }
  };

  static get $schema () {
    return {
      // Request User
      user: { type: Schema.Types.ObjectId, ref: 'User', index: true },

      // Request IP
      ip: { type: String },

      // Target ObjectId
      target: { type: Schema.Types.ObjectId, index: true },

      // Target Model
      target_model: { type: String, index: true },

      // Action const
      action: { type: String, index: true },

      // Log Entry Create Time
      created_at: { type: Date, default: Date.now }
    }
  }
}

module.exports = Audit.$model
