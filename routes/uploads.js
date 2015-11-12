/*********************************

 File:       uploads
 Function:
 Copyright:  AppDelegates LLC
 Date:       10/21/15
 Author:     mkahn

 **********************************/

var path = require('path');
var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var _ = require('lodash');

var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.normalize(global.appRoot + '/tmp/vids'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({storage: storage})


router.post('/video', upload.single('video'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    res.status(204).end();
});

router.get('/videos', function (req, res, next) {

    fs.readdir(path.normalize(global.appRoot + '/tmp/vids'), function (err, filenames) {

        var vids = _.remove(filenames, function (fn) {
            var idx = ['.mp4', '.MP4', '.mov', '.MOV'].indexOf(path.extname(fn));
            return idx != -1;
        });
        res.writeHead(200, {'content-type': 'application/json'});
        res.write(JSON.stringify(vids));
        res.end();
    });

});

router.post('/setvideo', function (req, res, next) {

    var filename = req.param('filename');
    var sourceDir = path.join(global.appRoot, '/tmp/vids');

    if (filename) {

        fs.copy(path.join(sourceDir, filename), path.join(global.appRoot, 'public/vids/attract.mp4'), function (err) {
            if (err) {
                res.writeHead(406, {'content-type': 'application/json'});
                res.write(JSON.stringify({error: err}));
                res.end();
            } else {
                res.writeHead(200, {'content-type': 'application/json'});
                res.write(filename + " is now the video");
                res.end();

            }

        });  // copies file

    }


});


module.exports = router;
