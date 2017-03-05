var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tears');

var Resource = require('../models/resource');
var Update = require('../models/update');

router.post('/location/update', function (req, res, next) {
    Resource.findOne({ device : req.body.device }, function(err, device) {
        if(!err){
            if(!device){
                res.json("Error Updating Status");
            } else {
                device.latestLatitude = req.body.lat;
                device.latestLongitude = req.body.long;
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
            }
        } else {
            var data = {};
            data.status = "ERROR";
            res.send(JSON.stringify(data));
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
        lastUpdated : new Date().getTime(),
        latestLatitude : 0.00,
        latestLongitude : 0.00
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

router.get('/updates/count', function(req, res, next) {
    var data = {};

    data.updateCount = 0;

    res.send(JSON.stringify(data));
});

router.post('/updates/add', function (req, res, next) {

    Update.count({device : req.body.device}, function (err, count) {
        return count;
    })
    .then(function (count) {
        if(count == 0){
            var update = Update({
                device : req.body.device,
                added : new Date().getTime(),
                message : req.body.message
            });


            var data = {};

            update.save(function (err) {
                if (err) throw err;

                if(err){
                    data.status = "ERROR";
                    res.send(JSON.stringify(data));
                }

                data.status = "OK";
                res.send(JSON.stringify(data));
            });
        } else {
            var data = {};
            data.status = "ERROR";
            res.send(JSON.stringify(data));
        }
    });
});

function getUpdates(device){
    Update.find({device : device}, function (err, res) {
        return res;
    });
}

function countUpdates(device){

}

module.exports = router;
