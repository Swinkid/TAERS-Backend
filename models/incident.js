var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var incidentSchema = new Schema({
    location : String,
    type : String,
    status : String,
    priority : String,
    resourceId : String,
    details : String
});

var Incident = mongoose.model('Incident', incidentSchema);

module.exports = Incident;
