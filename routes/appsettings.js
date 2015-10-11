var express = require('express');
var router = express.Router();
// Formidable is a 3rd party node module for form parsing. Very handy! It's in the package.json dependencies.
// See: http://www.codediesel.com/nodejs/processing-file-uploads-in-node-js/
var formidable = require('formidable');
var util = require('util');
var fs = require('fs');
var path = require('path');



var fullpath = path.resolve(path.join(__dirname,"../content/nedb/appsettings.json"));
var lpath = "content/nedb/appsettings.json";

var Datastore = require('nedb'), db = new Datastore({filename:fullpath, autoload: true});

var logMsg = function(type, message){
    db.insert({ docType: "log", message: message, type: type, time: (new Date()).getTime() });
}

var sendFail = function(res, errString){
    res.writeHead(404, {'content-type': 'application/json'});
    res.write(JSON.stringify({ success: false, reason: errString}));
    res.end();
}

router.get('/setting/:setting_named', function (req, res) {

    var settingNamed = req.params.setting_named;

    if (settingNamed != undefined) {
        db.find({ docType: "setting", name: settingNamed}, function (err, docs) {
            if (err) {
                sendFail(err.toString());
            } else if (docs.length>0) {
                res.writeHead(200, {'content-type': 'application/json'});
                res.write(JSON.stringify(docs[0]));
                res.end();
            } else {
                sendFail(res, "Setting Not Found");
            }
        });
    } else {
        sendFail(res, "Malformed request: Missing parameter");
    }

});

// Value is in the JSON body in the format:  "setting":"value"
router.post('/setting/:setting_named', function (req, res) {

    var settingNamed = req.params.setting_named;

    var settings = req.body;
    var newValue = settings[settingNamed];


    if ( (newValue != undefined) && (settingNamed!=undefined) ) {
        db.update({ docType: "setting", name: settingNamed}, {$set: {value: newValue}}, {upsert: true}, function (err, numReplaced) {
            if (err) {
                sendFail(res, err.toString());
            } else {
                res.writeHead(200, {'content-type': 'application/json'});
                res.write(JSON.stringify({ success:true }));
                res.end();
            }
        });
    } else {
        sendFail(res, "Malformed request: Missing parameter");
    }

});


module.exports = router;