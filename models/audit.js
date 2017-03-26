var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var auditSchema = new Schema({
    user: String,
    action: String,
    context: String,
    created_at: Number
});

var Audit = mongoose.model('Audit', auditSchema);

module.exports = Audit;