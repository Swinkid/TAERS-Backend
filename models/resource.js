var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var resourceSchema = new Schema({
    device : String,
    callsign : String,
    status : String,
    type : String,
    lastUpdated : Date
});

var Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;