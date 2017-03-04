var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tears');

var Resource = require('../models/resource');

router.post('/location/update', function (req, res, next) {
    console.log(req.body);

    Resource.findOne({ device : req.body.device }, function(err, device) {
        if(!err){
            if(!device){
                res.json("Error Updating Status");
            }

            device.latestLatitude = req.body.lat;
            device.latestLongitude = req.body.long;
            device.lastUpdated = parseInt(new Date().getTime());

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
            device.lastUpdated = parseInt(new Date().getTime());

            device.save(function (err) {
                if(!err){
                    res.json("Status Updated");
                } else {
                    res.json("Error updating status");
                    console.log(err);
                }
            });

        } else {
            res.json("Error Updating Status");
        }
    });
});

router.post('/device/callsign/update', function(req, res, next){
    Resource.findOne({ device : req.body.device }, function(err, device) {
        var data = {};

        if(!err){
            if(!device){

                data.status = "ERROR";
                res.send(JSON.stringify(data));
            }

            device.callsign = req.body.callsign;
            device.lastUpdated = parseInt(new Date().getTime());

            device.save(function (err) {
                var data = {};

                if(!err){
                    data.status = "OK";
                } else {
                    data.status = "ERROR";
                }

                res.send(JSON.stringify(data));
            });

        } else {

            data.status = "ERROR";
            res.send(JSON.stringify(data));
        }
    });
});

router.post('/updates', function(req, res, next) {
    var data = {};

    data.updateCount = 0;

    res.send(JSON.stringify(data));
});

module.exports = router;
