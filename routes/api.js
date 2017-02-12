var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tears');

var Location = require('../models/location');
var Resource = require('../models/resource');

router.post('/location', function(req, res, next) {
    //TODO: Check & Validate

    var newLocation = Location({
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

router.post('/device/add', function(req, res, next){
    //TODO: Check & Validate

    var newDevice = Resource({
        device : req.body.device,
        callsign : req.body.callsign,
        status : 'OFFLINE',
        type : req.body.resourceType,
        lastUpdated : new Date()
    });

    newDevice.save(function (err) {
        if (err) throw err;

        if(err){
            res.json("Internal Server Error");
        }

        res.json("Update Completed");
    });
});

router.post('/device/status/update', function(req, res, next){
    Resource.findOne({ device : req.body.device }, function(err, device) {
        if(!err){
            if(!device){
                res.json("Error Updating Status");
            }

            device.status = req.body.status;
            device.lastUpdated = new Date();

            device.save(function (err) {
                if(!err){
                    res.json("Status Updated");
                } else {
                    res.json("Error updating status");
                }
            });

        } else {
            res.json("Error Updating Status");
        }
    });
});

router.post('/device/callsign/update', function(req, res, next){

});

router.get('/updates', function(req, res, next) {
    res.json("Nothing to fetch");
});

module.exports = router;
