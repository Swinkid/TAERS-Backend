var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var updateSchema = new Schema({
    device : String,
    message : String,
    added : Number
});

var Update = mongoose.model('Update', updateSchema);

module.exports = Update;
