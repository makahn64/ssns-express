var express = require('express');
var router = express.Router();
// Formidable is a 3rd party node module for form parsing. Very handy! It's in the package.json dependencies.
// See: http://www.codediesel.com/nodejs/processing-file-uploads-in-node-js/
var formidable = require('formidable');
var util = require('util');
var fs = require('fs');
var Datastore = require('nedb');
var path = require('path');





// Everything in this route module hangs off of /ss (see lines 10 and 36 in app.js)

//
// curl -X POST -F requireUser=1 -F imgfile=@<filename> -F userId=<uniqueString> http://localhost:3000/ss/imageupload
// Parameters:
// imgfile: the png file to upload
// userId: the unique object Id created by NeDB when the user is created. Analogous to NodeID in drupal, but a string.
// requireUser: optional, defaults to 1 (true), reject the upload if there is no corresponding user in the NeDB
//


router.post('/imageupload', function (req, res) {

    /**
     * This local function is called from various places within the route code.
     * The params come from formidable.
     * @param fields
     * @param files
     */
    function uploadImage(fields, files){

        /* Temporary location of our uploaded file */
        var temp_path = files.imgfile.path;
        /* The file name of the uploaded file */
        var file_name = files.imgfile.name;
        /* Location where we want to copy the uploaded file */
        var new_location = __dirname + '/../content/images/' + file_name;

        fs.rename(temp_path, new_location, function(err) {
            if (err) {
                console.error("Error renaming uploaded file: " + err);
                res.writeHead(500, {'content-type': 'application/json'});
                res.write('{ status: "error", error: "Failed moving image to content/images. Maybe permissions or disk space?"}');
                res.end();
            } else {
                console.log("File uploaded OK!");
                res.writeHead(200, {'content-type': 'application/json'});
                res.write('{status: "ok"}');
                res.end();
            }
        });

    }


    // Main entry for this route
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

        // Check POST variables
        if (('imgfile' in files) && ('userId' in fields)) {

            if (!('requireUser' in fields) || (fields.requireUser == 1)) {
                // Check if user in DB
                var db = new Datastore({filename:"content/nedb/dbase.json", autoload: true});
                db.find({_id: fields.userId}, function (err, docs) {
                    if (err || docs.length != 1) {

                        console.error("ERROR: Upload parameters incorrect or user not found.");
                        res.writeHead(406, {'content-type': 'application/json'});
                        res.write('{ status: "error", error: "userId not in database."}');
                        res.end();
                        return;

                    } else {
                        // Upload the image to /content/images and add the file to the users DB entry.
                        uploadImage(fields, files);
                        docs[0].imgFile = files.imgfile.name;
                        docs[0].utimeImageAdded = new Date().getTime();
                        docs[0].hasTakenPic = true;
                        var thisId = docs[0]._id;
                        db.update({_id : thisId}, docs[0], {}, function(err, numReplaced){
                            console.log("Replaced");
                        });
                        return;
                    }
                });
            } else {
                // We must have an override of the user lookup, just upload, do nothing with DB
                uploadImage(fields, files);
            }
        } else {
            // Bad parameters
            console.error("ERROR: Upload parameters incorrect.");
            res.writeHead(406, {'content-type': 'application/json'});
            res.write('{ status: "error", error: "Missing upload file, or userId"}');
            res.end();
        }

    });
});


// curl -X POST -F userEmail=mitch@appdelegates.com -F hair=none http://localhost:3000/ss/createUser

router.post('/createuser', function (req, res) {


    // Main entry for this route
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

        // Check POST variables
        // At a minimum, we must have a userEmail

        if (!('userEmail' in fields)){
            console.error("ERROR: Must have userEmail field.");
            res.writeHead(406, {'content-type': 'application/json'});
            res.write('{ status: "error", error: "userEmail not in parameters."}');
            res.end();
            return;
        }

        //TODO the upload function is private to the function above and sends a 200 out
        // and this needs to change so the route code has
        //control. The first use of ssns won't use this feature anyway
        // We can take the photo with the user data in one shot just by attaching
        //if ( 'imgfile' in files )
        //    fields.imgFile = uploadImage(fields, files);


        var db = new Datastore({filename:"content/nedb/dbase.json", autoload: true});

        // We're pretty losey-goosey with the document structure, whatever comes up, goes in.
        fields.docType = "user";
        fields.utimeUserCreated = new Date().getTime();
        fields.uploadedToCMS = false;
        fields.hasTakenPic = false;
        db.insert(fields, function(err, doc){
            if (err){
                console.log("Error adding user");
                res.writeHead(500, {'content-type': 'application/json'});
                res.write('{error: err}');
                res.end();
            } else {
                console.log("User  created OK!");
                res.writeHead(200, {'content-type': 'application/json'});
                res.write('{status: "ok", userId:'+doc._id+' }');
                res.end();
            }
        });

    });
});

// curl -X POST -F userId=lyYZ7RhCoMAyqIG http://localhost:3000/ss/getUserById
// check the userIds in the dbase.json after you have created some for testing.
router.post('/getUserById', function (req, res) {


    // Main entry for this route
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {

        // Check POST variables. Must have userId

        if (!('userId' in fields)){
            console.error("ERROR: Must have userId field.");
            res.writeHead(406, {'content-type': 'application/json'});
            res.write('{ status: "error", error: "userId not in parameters."}');
            res.end();
            return;
        }

        var db = new Datastore({filename:"content/nedb/dbase.json", autoload: true});

        db.find({ _id: fields.userId }, function(err, doc){
            if (err || doc.length==0){
                console.log("Error finding user");
                res.writeHead(500, {'content-type': 'application/json'});
                res.write('{error: "Error finding user"}');
                res.end();
            } else {
                console.log("User  created OK!");
                res.writeHead(200, {'content-type': 'application/json'});
                res.write('{status: "ok", data:' + JSON.stringify(doc) +' }');
                res.end();
            }
        });

    });
});

// This dumps out whatever shows up in the form. Good for testing.
router.post('/test', function(req, res) {
    //res.render('stub', { title: 'Debug Stub', stubtext:'Upload requested!' });

    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        res.end(util.inspect({fields: fields, files: files}));
    });
});


//pulls a listing of photos the attract app slideshow
router.get('/lsPhotos', function(req, res){

    var folder = __dirname + '/../content/images/'
    fs.readdir(folder, function(err, files){
        console.log(JSON.stringify(files));
        var images = [];
        var allowed = [".png", ".jpg", ".jpeg"];
        files.forEach(function(f){
            var ext = path.extname(f);
            if ( allowed.indexOf(ext) >-1 ){
                images.push(f)
            }
        });
        res.writeHead(200, {'content-type': 'application/json'});
        res.write('{status: "ok", data:' + JSON.stringify(images) +' }');
        res.end();

    })

});


module.exports = router;