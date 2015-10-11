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


var fullpath = path.resolve(path.join(__dirname,"../content/nedb/players.json"));
var lpath = "content/nedb/players.json";

var Datastore = require('nedb'), db = new Datastore({filename:fullpath, autoload: true});

var logMsg = function(type, message){
    db.insert({ docType: "log", message: message, type: type, time: (new Date()).getTime() });
}



router.get('/register', function (req, res) {

    res.writeHead(200, {'content-type': 'text/html'});
    res.write('<h1>Hi There!</h1>');
    res.end();

});


router.post('/register', function (req, res) {

    if (req.body!=undefined){

        var s = settings.getSettings();

        var guestData = req.body;
        guestData['msTimeAdded'] = new Date().getTime();
        guestData['eventName'] = s.eventName;
        guestData['docType'] = "guest";
        guestData['score'] = parseInt(guestData['score']);
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


router.post('/winner/:dbid', function (req, res) {

    var dbId = req.params.dbid;

    if (dbId!=undefined){
        var dt = new Date().toLocaleString();
        db.update({ _id: dbId }, { $set: { winner: true , wintime:dt} }, {}, function(err, numReplaced){
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


router.get('/test', function (req, res) {

    res.writeHead(200, {'content-type': 'text/html'});
    res.write('<h1>Guests Module is Running</h1>');
    res.end();

});

router.get('/allguests', function (req, res) {

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


router.get('/leaderboard', function (req, res) {

    // A score of ZERO in this game is reserved for abandoned completely
    db.find({ docType: "guest", score: { $gt: 0 }, archived: { $exists: false } }).sort({ score: -1 }).limit(10).exec( function(err, docs){
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

    db.remove({docType: "guest"},{multi: true}, function(err, numNuked){
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