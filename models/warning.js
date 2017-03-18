var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var warningSchema = new Schema({
    location : String,
    type : String,
    details : String,
    dateAdded : Number
});

var Warning = mongoose.model('Warning', warningSchema);

module.exports = Warning;
