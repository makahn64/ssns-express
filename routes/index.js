var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'ShareStation Server' });
});


router.get('/mktest', function(req, res) {
    res.render('mktest', { title: 'MK Test', author: 'Some Dude' });
});


module.exports = router;
