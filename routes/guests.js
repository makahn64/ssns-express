var express = require('express');
var router = express.Router();
// Formidable is a 3rd party node module for form parsing. Very handy! It's in the package.json dependencies.
// See: http://www.codediesel.com/nodejs/processing-file-uploads-in-node-js/
var formidable = require('formidable');
var util = require('util');
var fs = require('fs');
var path = require('path');

var settings = require("../settings_module.js");
var appSettings = settings.getSettings();


var fullpath = path.resolve(path.join(__dirname,"../content/nedb/guests.json"));
var lpath = "content/nedb/guests.json";

var Datastore = require('nedb'), db = new Datastore({filename:fullpath, autoload: true});

var logMsg = function(type, message){
    db.insert({ docType: "log", message: message, type: type, time: (new Date()).getTime() });
}

router.get('/register', function (req, res) {

    res.writeHead(200, {'content-type': 'text/html'});
    res.write('<h1>Register GET</h1>');
    res.end();

});

router.post('/register', function (req, res) {

    if (req.body.data!=undefined){

        var s = settings.getSettings();

        var guestData = req.body.data;
        guestData['msTimeAdded'] = new Date().getTime();
        guestData['eventName'] = s.eventName;
        guestData['docType'] = "guest";
        db.insert(guestData, function(err, doc){
            console.log("Inserted!");
            res.writeHead(200, {'content-type': 'application/json'});
            res.write(JSON.stringify(doc));
            res.end();

        });
    } else {
        res.writeHead(400, {'content-type': 'application/json'});
        res.write(JSON.stringify({error: "malformed request"}));
        res.end();
    }

});

/*
  USAGE:
  queue/<dbid>

  Returns queue-time, wait-time, queue-depth

  guest has: "queued" property added to them.

  Eventually this should be somehow tied to each activation to have "lines". Or we could have a Queue DB per activation...

 */

router.post('/queue/:dbid', function (req, res) {

    var dbId = req.params.dbid;

    if (dbId!=undefined){
        var s = settings.getSettings();
        var qt = new Date().getTime();
        db.update({ _id: dbId }, { $set: { queued: qt }}, {}, function(err, numReplaced){
            if (numReplaced==1){
                // normal operation
                res.writeHead(200, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"ok", enqueueTime: qt}));
                res.end();
            } else if (numReplaced==0){
                // User not registered
                res.writeHead(404, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"no such user"}));
                res.end();
            } else if (err){
                res.writeHead(500, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"error accessing db: "+err.toString()}));
                res.end();
            }
        });

    } else {
        res.writeHead(400, {'content-type': 'application/json'});
        res.write(JSON.stringify({result:"malformed request, maybe no db id?"}));
        res.end();
    }

});

router.post('/waitlist/:dbid', function (req, res) {

    var dbId = req.params.dbid;

    if (dbId!=undefined){
        var s = settings.getSettings();
        var qt = new Date().getTime();
        db.update({ _id: dbId, queued: { $exists:true }  }, { $set: { waitlisted: qt }}, {}, function(err, numReplaced){
            if (numReplaced==1){
                // normal operation
                res.writeHead(200, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"ok", waitlistTime: qt}));
                res.end();
            } else if (numReplaced==0){
                // User not registered
                res.writeHead(404, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"no such user in queue"}));
                res.end();
            } else if (err){
                res.writeHead(500, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"error accessing db: "+err.toString()}));
                res.end();
            }
        });

    } else {
        res.writeHead(400, {'content-type': 'application/json'});
        res.write(JSON.stringify({result:"malformed request, maybe no db id?"}));
        res.end();
    }

});

router.post('/dequeue/:dbid', function (req, res) {

    var dbId = req.params.dbid;

    if (dbId!=undefined){
        var s = settings.getSettings();
        var qt = new Date().getTime();
        db.update({ _id: dbId }, { $unset: { queued: true , waitlisted:true} }, {}, function(err, numReplaced){
            if (numReplaced==1){
                // normal operation
                res.writeHead(200, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"ok"}));
                res.end();
            } else if (numReplaced==0){
                // User not registered
                res.writeHead(404, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"no such user"}));
                res.end();
            } else if (err){
                res.writeHead(500, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"error accessing db: "+err.toString()}));
                res.end();
            }
        });

    } else {
        res.writeHead(400, {'content-type': 'application/json'});
        res.write(JSON.stringify({result:"malformed request, maybe no db id?"}));
        res.end();
    }

});

router.post('/nextup/:dbid', function (req, res) {

    var dbId = req.params.dbid;

    if (dbId!=undefined){
        var qt = new Date().getTime();
        db.update({ _id: dbId }, { $unset: { queued: true , waitlisted:true, archived:true} }, {}, function(err, numReplaced){
            if (numReplaced==1){
                // normal operation
                res.writeHead(200, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"ok"}));
                res.end();
                appSettings.nextUp = dbId;
                logMsg("info", "Guest _id: "+dbId + " moved to on deck");
            } else if (numReplaced==0){
                // User not registered
                res.writeHead(404, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"no such user"}));
                res.end();
            } else if (err){
                res.writeHead(500, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"error accessing db: "+err.toString()}));
                res.end();
            }
        });

    } else {
        res.writeHead(400, {'content-type': 'application/json'});
        res.write(JSON.stringify({result:"malformed request, maybe no db id?"}));
        res.end();
    }

});


router.post('/recordTime/:rtime', function (req, res) {


    var rtime = parseInt( req.params.rtime );

    if ( rtime>0 ){

        db.update({ _id: appSettings.nextUp }, { $set: { score : rtime} }, {}, function(err, numReplaced){
            if (numReplaced==1){
                // normal operation
                res.writeHead(200, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"ok"}));
                res.end();
                appSettings.nextUp = null;
            } else if (numReplaced==0){
                // User not registered
                res.writeHead(409, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"on deck ID not in DB"}));
                res.end();
                logMsg("error", "RecordTime called with no one on deck!");
                appSettings.nextUp = null;
            } else if (err){
                res.writeHead(500, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"error accessing db: "+err.toString()}));
                res.end();
            }
        });

    } else {
        res.writeHead(400, {'content-type': 'application/json'});
        res.write(JSON.stringify({result:"malformed request, maybe no time?"}));
        res.end();
    }

});

router.post('/recordTimeByDbId/:dbid/:rtime', function (req, res) {


    var rtime = parseInt( req.params.rtime );
    var dbid = req.params.dbid;

    if ( rtime>0 && dbid!=undefined){

        db.update({ _id: dbid }, { $set: { score : rtime} }, {}, function(err, numReplaced){
            if (numReplaced==1){
                // normal operation
                res.writeHead(200, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"ok"}));
                res.end();
                appSettings.nextUp = null;
            } else if (numReplaced==0){
                // User not registered
                res.writeHead(409, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"on deck ID not in DB"}));
                res.end();
            } else if (err){
                res.writeHead(500, {'content-type': 'application/json'});
                res.write(JSON.stringify({result:"error accessing db: "+err.toString()}));
                res.end();
            }
        });

    } else {
        res.writeHead(400, {'content-type': 'application/json'});
        res.write(JSON.stringify({result:"malformed request, maybe no time?"}));
        res.end();
    }

});

router.get('/nextup', function (req, res) {


    if (appSettings.nextUp==null){
        res.writeHead(404, {'content-type': 'application/json'});
        res.write(JSON.stringify({result:"no one on deck"}));
        res.end();
    } else {
        db.find({ _id: appSettings.nextUp}, function(err, docs){
            res.writeHead(200, {'content-type': 'application/json'});
            res.write(JSON.stringify({ onDeck: docs[0] }));
            res.end();
        });
    }

});

router.get('/test', function (req, res) {

    res.writeHead(200, {'content-type': 'text/html'});
    res.write('<h1>Guests Module is Running</h1>');
    res.end();

});

router.get('/allguests', function (req, res) {

    db = new Datastore({filename:fullpath, autoload: true});
    db.find({ docType: "guest" }, function(err, docs){
        if (!err){
            res.writeHead(200, {'content-type': 'application/json'});
            res.write(JSON.stringify(docs));
            res.end();
        } else {
            res.writeHead(500, {'content-type': 'application/json'});
            res.write(JSON.stringify({ data: "bad db error"}));
            res.end();
        }
    })

});

router.get('/allqueued', function (req, res) {

    db.find({ docType: "guest", queued: { $exists: true}, waitlisted: { $exists: false} }).sort({ queued: 1 }).exec( function(err, docs){
        if (!err){
            res.writeHead(200, {'content-type': 'application/json'});
            res.write(JSON.stringify(docs));
            res.end();
        } else {
            res.writeHead(500, {'content-type': 'application/json'});
            res.write(JSON.stringify({ data: "bad db error"}));
            res.end();
        }
    })

});


router.get('/allwaitlist', function (req, res) {

    db.find({ docType: "guest", queued: { $exists: true} , waitlisted: { $exists: true} }).sort({ queued: 1 }).exec( function(err, docs){
        if (!err){
            res.writeHead(200, {'content-type': 'application/json'});
            res.write(JSON.stringify(docs));
            res.end();
        } else {
            res.writeHead(500, {'content-type': 'application/json'});
            res.write(JSON.stringify({ data: "bad db error"}));
            res.end();
        }
    })

});

router.get('/leaderboard', function (req, res) {

    db.find({ docType: "guest", score: { $exists: true}, archived: { $exists: false } }).sort({ score: 1 }).exec( function(err, docs){
        if (!err){
            res.writeHead(200, {'content-type': 'application/json'});
            res.write(JSON.stringify(docs));
            res.end();
        } else {
            res.writeHead(500, {'content-type': 'application/json'});
            res.write(JSON.stringify({ data: "bad db error"}));
            res.end();
        }
    })

});

router.post('/eraseall', function (req, res) {

    db.remove({},{multi: true}, function(err, numNuked){
            console.log("Wiped!");
            res.writeHead(200, {'content-type': 'application/json'});
            res.write(JSON.stringify({ removed: numNuked }));
            res.end();

        });

});

router.post('/clearlb', function (req, res) {

    db.update({ docType: "guest", score: { $exists: true} }, { $set: { archived : true } }, { multi: true }, function(err, numReplaced){

            res.writeHead(200, {'content-type': 'application/json'});
            res.write(JSON.stringify({result:"ok"}));
            res.end();

    });

});

router.post('/archive/:dbid', function (req, res) {

    var dbId = req.params.dbid;

    if (dbId != undefined) {
        db.update({ _id: dbId }, { $set: { archived: true} }, {}, function (err, numReplaced) {
            if (numReplaced == 1) {
                // normal operation
                res.writeHead(200, {'content-type': 'application/json'});
                res.write(JSON.stringify({result: "ok"}));
                res.end();
            } else if (numReplaced == 0) {
                // User not registered
                res.writeHead(404, {'content-type': 'application/json'});
                res.write(JSON.stringify({result: "no such user"}));
                res.end();
            } else if (err) {
                res.writeHead(500, {'content-type': 'application/json'});
                res.write(JSON.stringify({result: "error accessing db: " + err.toString()}));
                res.end();
            }
        });
    };
});

module.exports = router;