var express = require('express');
var router = express.Router();
var settings = require("../settings_module.js");

/* GET home page. */
router.get('/', function(req, res) {
  var s = settings.getSettings();
  res.render('index', { title: 'Lexus Racing Challenge', eventId: s.eventId, eventName: s.eventName });
});

router.post('/settings', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            var s = settings.getSettings();
            s.eventId = fields.eventId;
            settings.setSettings(s);
            res.writeHead(200, {'content-type': 'text/plain'});
            res.write('received upload:\n\n');
            res.end(util.inspect({fields: fields, files: files}));
        });
    });

});

router.get('/mktest', function(req, res) {
    res.render('mktest', { title: 'MK Test', author: 'Some Dude' });
});


module.exports = router;
