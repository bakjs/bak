const { Model, Schema } = require('@bakjs/mongo')

class Audit extends Model {
  static get $options () {
    return {
      strict: false,
      timestamps: false // We don't need updated_at
    }
  }

  static get $schema () {
    return {
      // Request User
      user: { type: Schema.Types.ObjectId, ref: 'User', index: true },

      // Request IP
      ip: { type: String },

      // Resource
      resource: { type: Schema.Types.ObjectId, refPath: 'kind', index: true },

      // Resource kind
      kind: { type: String, index: true },

      // Action const
      action: { type: String, index: true },

      // Log Entry Create Time
      created_at: { type: Date, default: Date.now },

      // Tags
      tags: [ String ]
    }
  }
}

module.exports = Audit.$model
