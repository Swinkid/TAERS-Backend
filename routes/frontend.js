var express = require('express');
var router = express.Router();
var Resource = require('../models/resource');

router.get('/resource', function(req, res, next) {
    if(req.query.status) {
        Resource.find({status: req.query.status}, function (err, resources) {
            if (!err) {
                res.json(resources);
            } else {
                res.json("Error");
            }
        });

    } else if(req.query.type){
        Resource.find({type: req.query.type}, function (err, resources) {
            if (!err) {
                res.json(resources);
            } else {
                res.json("Error");
            }
        });
    } else {
        Resource.find({}, function(err, resources){
            if(!err){
                res.json(resources);
            } else {
                res.json("Error");
            }
        });
    }
});



module.exports = router;
