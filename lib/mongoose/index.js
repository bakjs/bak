const Mongoose = require('mongoose-fill');

// Use native promises
Mongoose.Promise = global.Promise;

module.exports = Mongoose;