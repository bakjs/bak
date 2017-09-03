const { Schema } = require('mongoose')
const Model = require('./model')
const plugin = require('./plugin')


module.exports = {
    Model,
    default: plugin,
    Schema
}