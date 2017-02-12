var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = new Schema({
    device: String,
    long: String,
    lat: String,
    timestamp: Date,
    received: Date
});

var Location = mongoose.model('Location', locationSchema);

module.exports = Location;