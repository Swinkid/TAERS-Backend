var express = require('express');
var router = express.Router();
var _ = require('lodash');

var Resource = require('../models/resource');

router.get('/resource', function(req, res, next) {
    Resource.find({}, function(err, resources){
        if(!err){
            res.json(resources);
        } else {
            res.json("Error");
        }
    });
});



module.exports = router;
