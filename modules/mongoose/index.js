import Mongoose from "mongoose-fill";

// Use native promises
Mongoose.Promise = global.Promise;

export default Mongoose;