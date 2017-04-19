var express = require('express');
var router = express.Router();
var _ = require('lodash');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/tears');
var request = require('request');

var Resource = require('../models/resource');
var Update = require('../models/update');
var User = require('../models/user');
var Incident = require('../models/incident');
var Warning = require('../models/warning');
var Audit = require('../models/audit');


var GOOGLE_MAPS_GEOCODING_KEY = "&key=AIzaSyDPNPm8aY6sIMc83emA-J2m0wXJUv0MNpc";
var GOOGLE_MAPS_GEOCODING_URL = "https://maps.googleapis.com/maps/api/geocode/json?address=";

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

router.post('/device/update', function (req, res, next) {
   if(req.body.id){
       Resource.findById(req.body.id, function(err, resource) {
           if (err) {
               res.json("Internal Server Error");
           }

           resource.device = req.body.device;
           resource.callsign = req.body.callsign;
           resource.type = req.body.resourceType;
           resource.status = req.body.status;

           // save the user
           resource.save(function(err) {
               if(err){
                   res.json("Internal Server Error");
               }

               res.json("Update Completed");
           }).then(function (incident) {
               var newAudit = Audit({
                   user: req.body.author,
                   action: 'Edit',
                   context: 'Resources',
                   created_at: new Date().getTime()
               });

               newAudit.save(function (err, audit) {
                   if(err){
                       console.log("Error auditing");
                   }
               });
           });;

       });
   } else {
       res.json("Internal Server Error");
   }
});

router.get('/device/get', function (req, res, next) {
    if(req.query.id){
        Resource.find({_id: req.query.id}, function (err, resources) {
            if (!err) {
                res.json(resources);
            } else {
                res.json("Internal Server Error");
            }
        });
    } else {
        res.json("Error")
    }
});

router.post('/device/add', function(req, res, next){
    Resource.count({device : req.body.device}, function (err, count) {
        return count;
    }).then(function (count) {
        if(count == 0){
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
                if(err){
                    res.json("Internal Server Error");
                }

                res.json("Update Completed");
            });
        } else {
            res.json("Duplicate");
        }
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

router.get('/device/delete', function (req, res, next) {
    var data = {};

    Resource.findByIdAndRemove(req.query.id, function (err, resource) {
        if(!err){
            data.status = "OK";
        } else {
            data.status = "ERROR";
        }

        res.json(data);
    }).then(function (incident) {
        var newAudit = Audit({
            user: req.query.author,
            action: 'Delete',
            context: 'Resources',
            created_at: new Date().getTime()
        });

        newAudit.save(function (err, audit) {
            if(err){
                console.log("Error auditing");
            }
        });
    });;
});

router.get('/updates/count', function(req, res, next) {
    Update.count({device : req.body.device}, function (err, count) {
        return count;
    }).then(function (count) {
        var data = {};

        data.updateCount = count;

        res.send(JSON.stringify(data));
    });
});

router.post('/updates/get', function (req, res, next) {
   Update.findOne({device : req.body.device}, function (err, update) {
       var data = {};
       if(!err){
          if(!update){
              data.status = "NO UPDATES";
              res.send(JSON.stringify(data));
          }

          return update;
      } else {
          data.status = "ERROR";
          res.send(JSON.stringify(data));
      }
   })
   .then(function (update) {
       Update.remove({ _id: update._id}, function (err) {
           var data = {};

           data.status = "OK";
           data.message = update.message;
           data.added = update.added;

           res.send(JSON.stringify(data));
       });
   });
});

router.post('/updates/add', function (req, res, next) {
    var data = {};

    Update.count({device : req.body.device}, function (err, count) {
        return count;
    })
    .then(function (count) {
        if(count == 0){
            Incident.findById(req.body.incidentId, function (err, incident) {
                if(err){
                    data.status = "ERROR";
                    res.json(data);
                } else {
                    incident.resourceId = req.body.device;

                    incident.save(function (err) {
                        if(err){
                            console.log(err);
                        }
                        return incident;
                    });
                }
            }).then(function (incident) {
                var update = Update({
                    device : req.body.device,
                    added : new Date().getTime(),
                    message : incident.type + "," + incident.location
                });

                update.save(function (err) {
                    if(err){
                        data.status = "ERROR";
                        res.send(JSON.stringify(data));
                    }

                    data.status = "OK";
                    res.send(JSON.stringify(data));
                });
            });
        } else {
            var data = {};
            data.status = "ERROR";
            res.send(JSON.stringify(data));
        }
    });
});

/**
 * Users APIs
 */

router.get('/users/list', function (req, res, next) {

    var options = {};

    if(req.query.type){
        options.jobtitle = req.query.type
    }

    User.find(options).select('-password').exec(function (err, data) {
        res.send(JSON.stringify(data));
    });
});

router.get('/users/delete', function (req, res, next) {
    User.findByIdAndRemove(req.query.id, function (err, users) {
        res.json(users);
    }).then(function (incident) {
        var newAudit = Audit({
            user: req.query.author,
            action: 'Delete',
            context: 'Users',
            created_at: new Date().getTime()
        });

        newAudit.save(function (err, audit) {
            if(err){
                console.log("Error auditing");
            }
        });
    });
});

router.post('/users/update', function (req, res, next) {
    // TODO
});

router.post('/users/add', function (req, res, next) {
    User.count({username : req.body.username}, function (err, count) {
        if(err){
            res.json("Internal Server Error");
        }

        return count;
    }).then(function (count) {
        if(count == 0){
            var tempUser = new User();

            tempUser.username = req.body.username;
            tempUser.email = req.body.email;
            tempUser.password = tempUser.generateHash(req.body.password);
            tempUser.firstname = req.body.firstname;
            tempUser.lastname = req.body.lastname;
            tempUser.jobtitle = req.body.jobtitle;
            tempUser.avatar = "//placehold.it/150x150";


            tempUser.save(function (err) {
                if(err){
                    res.json("Internal Server Error");
                }

                res.json("Completed");
            }).then(function (user) {
                var newAudit = Audit({
                    user: req.body.author,
                    action: 'New',
                    context: 'Users',
                    created_at: new Date().getTime()
                });

                newAudit.save(function (err, audit) {
                    if(err){
                        console.log("Error auditing");
                    }
                });
            });
     } else {
            res.json("Duplicate");
        }
    });
});

router.get('/users', function (req, res, next) {
   User.findOne({_id: req.query.id}, function (err, user) {
      if(!err){
          res.json(user);
      }
   });
});


/**
 * Incident APIs
 */

router.post('/incident/add', function (req, res, next) {

    var address = req.body.location;

    address = address.replace(/\s/g, "+");

    var URL = GOOGLE_MAPS_GEOCODING_URL + address + GOOGLE_MAPS_GEOCODING_KEY;

    request(URL, function (err, httpResponse, body) {
        if(JSON.parse(body).results.length > 0){
            var location = JSON.parse(body).results[0].geometry.location;

            if(location !== undefined || location !== 'undefined'){
                var newIncident = Incident({
                    location: req.body.location,
                    type : req.body.type,
                    status: req.body.status,
                    priority : req.body.priority,
                    resourceId : '',
                    details : req.body.details,
                    dateAdded : new Date().getTime(),
                    lat : location.lat,
                    long: location.lng
                });

                newIncident.save(function (err, incident) {
                    if (err) throw err;

                    if(err){
                        res.json("Internal Server Error");
                    }

                    res.json(incident._id);

                    return incident;
                }).then(function (incident) {
                    var newAudit = Audit({
                        user: req.body.author,
                        action: 'New',
                        context: 'Incident',
                        created_at: new Date().getTime()
                    });

                    newAudit.save(function (err, audit) {
                        if(err){
                            console.log("Error auditing");
                        }
                    });
                });
            } else {
                res.json("Internal Server Error");
            }
        } else {
            res.json("Internal Server Error");
        }

    });
});

router.post('/incident/update', function (req, res, next) {
    // TODO
});

router.get('/incident', function (req, res, next) {
    Incident.findOne({_id : req.body.id }, function (err, data) {
        if(err){
            res.json("Internal Server Error");
        }

        res.json(data);
    });
});

router.get('/incident/all', function (req, res, next) {

    if(req.query.type){
        Incident.find({type: req.query.type}, function (err, data) {
            if(err){
                res.json("Internal Server Error");
            }

            res.json(data);
        })
    } else {
        Incident.find({}, function (err, data) {
            if(err){
                res.json("Internal Server Error");
            }

            res.json(data);
        })
    }
});

router.get('/incident/delete', function (req, res, next) {
   if(req.query.id){
       Incident.findByIdAndRemove(req.query.id, function (err, incident) {
           res.json(incident);
       }).then(function (incident) {
           var newAudit = Audit({
               user: req.query.author,
               action: 'Delete',
               context: 'Incident',
               created_at: new Date().getTime()
           });

           newAudit.save(function (err, audit) {
               if(err){
                   console.log("Error auditing");
               }
           });
       });
   } else {
       res.json("Internal Server Error");
   }
});

/**
 * Warnings API
 */
router.post('/warning/new', function (req, res, next) {
    var warningData = new Warning({
        location : req.body.location,
        type : req.body.type,
        details : req.body.details,
        dateAdded : new Date().getTime()
    });

    warningData.save(function (err, incident) {
        if (err) throw err;

        if(err){
            res.json("Internal Server Error");
        }

        res.json(incident);
    }).then(function (incident) {
        var newAudit = Audit({
            user: req.body.author,
            action: 'New',
            context: 'Warning',
            created_at: new Date().getTime()
        });

        newAudit.save(function (err, audit) {
            if(err){
                console.log("Error auditing");
            }
        });
    });
});

router.post('/warning', function (req, res, next) {
    Warning.find({location : req.body.location}, function (err, data) {
       res.json(data);
    });
});


/**
 * Audit Logging API
 */

//TODO: Look in google keep for pagination example
router.get('/auditlog', function (req, res, next) {
    //TODO pagination, variable limit
    Audit.find({}).sort({created_at: -1}).limit(100).exec(function (err, data) {
       if(err){
           res.json("Internal Server Error");
       }

       res.json(data);
    });
});

/**
 * /system/status
 *
 * Get system information, such as system time and status.
 *
 * @method GET
 */
router.get('/system/status', function (req, res, next) {
   var system = {};

   system.status = "OK";
   system.time = new Date();

    res.json(system);
});

router.get('/system/stats', function (req, res, next) {
    Incident.count({status: 'Open'}, function (err, openCount) {

        Incident.count({status: 'Resolved'}, function (err, closedCount) {

            Warning.count({type: 'Violent'}, function (err, violentCount) {

                Warning.count({type: 'General'}, function (err, generalCount) {

                    Warning.count({type: 'Weapons'}, function (err, weaponsCount) {

                        Warning.count({type: 'Entry Code'}, function (err, entryCodeCount) {

                            User.count({jobtitle: 'Call Handler'}, function (err, callHandlerCount) {

                                User.count({jobtitle: 'Analyst'}, function (err, analystCount) {

                                    User.count({jobtitle: 'Manager'}, function (err, managerCount) {
                                        
                                        Resource.count({type: 'General'}, function (err, generalResCount) {

                                            Resource.count({type: 'Traffic'}, function (err, trafficCount) {

                                                Resource.count({type: 'Armed'}, function (err, armedCount) {

                                                    Resource.count({type: 'Emergency'}, function (err, emergencyCount) {

                                                        Resource.count({status: 'ONLINE'}, function (err, onlineCount) {

                                                           Resource.count({status: 'OFFLINE'}, function (err, offlineCount) {

                                                               Incident.find({ dateAdded: {$gt: (new Date().getTime() - 604800000)}}, function (err, result) {
                                                                   var response = {};
                                                                   response.incidents = {};
                                                                   response.warnings = {};
                                                                   response.users = {};
                                                                   response.resources = {};
                                                                   response.resources.status = {};

                                                                   response.week = {};
                                                                   response.week['sunday'] = [];
                                                                   response.week['monday'] = [];
                                                                   response.week['tuesday'] = [];
                                                                   response.week['wednesday'] = [];
                                                                   response.week['thursday'] = [];
                                                                   response.week['friday'] = [];
                                                                   response.week['saturday'] = [];

                                                                   _.forEach(result, function (val) {
                                                                       switch(new Date(val['dateAdded']).getDay()){
                                                                           case 0:
                                                                               response.week['sunday'].push(val);
                                                                               break;
                                                                           case 1:
                                                                               response.week['monday'].push(val);
                                                                               break;
                                                                           case 2:
                                                                               response.week['tuesday'].push(val);
                                                                               break;
                                                                           case 3:
                                                                               response.week['wednesday'].push(val);
                                                                               break;
                                                                           case 4:
                                                                               response.week['thursday'].push(val);
                                                                               break;
                                                                           case 5:
                                                                               response.week['friday'].push(val);
                                                                               break;
                                                                           case 6:
                                                                               response.week['saturday'].push(val);
                                                                               break;
                                                                       }
                                                                   });

                                                                   var averageResponse = 0;
                                                                   var responseCount = 0;

                                                                   _.forEach(result, function (entry) {
                                                                      if(typeof entry['timeClosed'] !== undefined || entry['timeClosed'] !== 0){
                                                                          averageResponse = averageResponse + (entry['timeClosed'] - entry['dateAdded']);
                                                                          responseCount =  responseCount + 1;
                                                                      }
                                                                   });


                                                                   var average = new Date(averageResponse / responseCount);

                                                                   response.avgResponse = average.getHours() + " hr " + average.getMinutes() + " Mins ";

                                                                   response.incident = {};
                                                                   response.incident.types = {};
                                                                   response.incident.types.RTC = 0;
                                                                   response.incident.types.Drugs = 0;
                                                                   response.incident.types.Theft = 0;
                                                                   response.incident.types.Shoplifting = 0;
                                                                   response.incident.types.ASB = 0;
                                                                   response.incident.types.Burglary = 0;
                                                                   response.incident.types.VC = 0;
                                                                   response.incident.types.Robbery = 0;
                                                                   response.incident.types.CD = 0;
                                                                   response.incident.types.PW = 0;
                                                                   response.incident.types.GR = 0;

                                                                   _.forEach(result, function (r) {
                                                                      switch(r['type']){
                                                                          case "RTC":
                                                                              response.incident.types.RTC += 1;
                                                                              break;
                                                                          case "Drugs":
                                                                              response.incident.types.Drugs += 1;
                                                                              break;
                                                                          case "Theft":
                                                                              response.incident.types.Theft += 1;
                                                                              break;
                                                                          case "Shoplifting":
                                                                              response.incident.types.Shoplifting += 1;
                                                                              break;
                                                                          case "ASB":
                                                                              response.incident.types.ASB += 1;
                                                                              break;
                                                                          case "Burglary":
                                                                              response.incident.types.Burglary += 1;
                                                                              break;
                                                                          case "VC":
                                                                              response.incident.types.VC += 1;
                                                                              break;
                                                                          case "Robbery":
                                                                              response.incident.types.Robbery += 1;
                                                                              break;
                                                                          case "CD":
                                                                              response.incident.types.CD += 1;
                                                                              break;
                                                                          case "PW":
                                                                              response.incident.types.PW += 1;
                                                                              break;
                                                                          case "GR":
                                                                              response.incident.types.GR += 1;
                                                                              break;
                                                                      }
                                                                   });


                                                                   response.incidents['open'] = openCount;
                                                                   response.incidents['closed'] = closedCount;
                                                                   response.incidents['total'] = openCount + closedCount;

                                                                   response.warnings['violent'] = violentCount;
                                                                   response.warnings['general'] = generalCount;
                                                                   response.warnings['weapons'] = weaponsCount;
                                                                   response.warnings['entrycode'] = entryCodeCount;
                                                                   response.warnings['total'] = violentCount + generalCount + weaponsCount + entryCodeCount;

                                                                   response.users['callhandler'] = callHandlerCount;
                                                                   response.users['analyst'] = analystCount;
                                                                   response.users['managers'] = managerCount;
                                                                   response.users['total'] = callHandlerCount + analystCount + managerCount;

                                                                   response.resources['general'] = generalResCount;
                                                                   response.resources['armed'] = armedCount;
                                                                   response.resources['traffic'] = trafficCount;
                                                                   response.resources['emergency'] = emergencyCount;
                                                                   response.resources['total'] = generalResCount + armedCount + trafficCount + emergencyCount;

                                                                   response.resources.status['Online'] = onlineCount;
                                                                   response.resources.status['Offline'] = offlineCount;

                                                                   return res.json(response);
                                                               });
                                                           });

                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });



    });
});

module.exports = router;
