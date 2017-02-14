const Controller = require('./lib/controller');
const Model = require('./lib/mongoose/model');
const init = require('./lib/init');

// We only expose essential modules here
module.exports = {
    Controller,
    Model,
    init,
};