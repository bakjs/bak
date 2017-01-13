const Controller = require('./lib/controller');
const Model = require('./lib/mongoose/model');
const Init = require('./lib/init');

// We only expose core modules here
module.exports = {
    Controller,
    Model,
    Init
};