var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var resourceSchema = new Schema({
    device : String,
    callsign : String,
    status : String,
    type : String,
    latestLatitude : Number,
    latestLongitude : Number,
    lastUpdated : Number
});

var Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
