var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var players = require('./routes/players');
var appsettings = require('./routes/appsettings');


// Added by Mitch
var Datastore = require('nedb'), db = new Datastore({filename:"content/nedb/dbase.json", autoload: true});
db.insert({ docType: "adiLog", tag: "appStart", utime: new Date().getTime() });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

//TODO Figure out why favicon is not working! Should get the ss icon, not the express icon.
//favicon is supposed to change the little bug in browser tabs
//app.use(favicon(__dirname + '/public/images/clientico.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// These set up the routes (i.e. URL paths) and how they map to the modules that handle them.
// The code for each of these routes is in /routes folder. /users is a stock Express thing,
// probably not needed.
app.use('/', routes);
app.use('/players', players);
app.use('/settings', appsettings);


/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var settings = require('./settings_module');
var ok = settings.getSettings();

module.exports = app;
