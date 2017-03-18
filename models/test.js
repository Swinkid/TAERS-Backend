var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var testSchema = new Schema({
    text: String,
    created_at: Date
});

var Test = mongoose.model('Test', testSchema);

module.exports = Test;