// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var locationSchema = new Schema({
    device: String,
    long: String,
    lat: String,
    timestamp: Date,
    received: Date
});

// the schema is useless so far
// we need to create a model using it
var Location = mongoose.model('Location', locationSchema);

// make this available to our users in our Node applications
module.exports = Location;