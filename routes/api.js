var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tears');

var location = require('../models/location');

router.post('/location', function(req, res, next) {
    var newLocation = location({
        device: req.body.device,
        lat: req.body.lat,
        long: req.body.long,
        timestamp: new Date(req.body.timestamp),
        received: new Date()
    });

    newLocation.save(function (err) {
        if (err) throw err;

        if(err){
            res.json("Internal Server Error");
        }

        res.json("Update Completed");
    });
});

router.get('/updates', function(req, res, next) {
    res.json("Nothing to fetch");
});

module.exports = router;
