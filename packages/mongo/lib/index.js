const Mongoose = require('mongoose')
const Model = require('./model')
const plugin = require('./plugin')

// Use native promises
Mongoose.Promise = global.Promise

module.exports = {
  Model,
  default: plugin,
  Schema: Mongoose.Schema,
  Mongoose
}
