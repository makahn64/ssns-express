ShareStation Node Server (SSNS)
-------------------------------

The application uses Node.JS with the Express framework. It's a stock Express install
(see the Express docs for install method), but the Hogan templating engine is used
instead of the default. Hogan was chosen because it uses essentially straight HTML
with "mustache {{}}" style replacement (like Angular.JS). Templating is only used for the
few human readable pages in the app.

The app's main entry point is bin/www (not app.js!).  To run it from PHPExpress, set up a run
configuration (Run->Edit Configurations) pointing to the bin/www file as the starting point.

Basic Operation
---------------

Express is a more fully-featured webserver framework added on to Node.js. It takes care of
a lot of the common functions we would have to write, if we were to start implementing a full
web server application from bare Node.

When an inbound URL request is seen, Express will check that URL against "routes" that have
been attached to the server (see around line 31 in app.js). A URL path is attached to js
module to service that route (or routes). We can have all ssns routes in a single js file, or
break it up into a few (which is what I might chose to do).

In a route file, you have the option of responding either directly (writing json or html), or
responding through the Hogan templating engine. Here's a direct response (from routes/ssroutes.js):

    res.writeHead(200, {'content-type': 'application/json'});
    res.write('{status: "ok"}');
    res.end();

It's pretty obvious, but the above just dumps out a json object.

If you wanted to use Hogan to make pretty human-readable HTML, you can do (this code is in routes/index.js):

    res.render('mktest', { title: 'MK Test', author: 'Some Dude' });

The above code grabs the file 'views/mktest.hjs' and replaces the {{title}} and {{author}}
placeholders with the corresponding JSON values. I've created a template that you can copy
to create new templates called "adstemplate.hjs". Just copy it and put your code where you
see the comments.

If Express does not match an installed route, it tries to get the URL from the /public folder, just
like Apache would. This is where we will put the Brand Ambassador app code.  That code is going to
be AngularJS and won't benefit from templating at all.

So think of it like this, if what you're writing is like a PHP module that mucks with a database,
issues a unix command (or Windows), coughs out JSON etc. then this code belongs as a route.
If it's going to be human readable, throw the output through the Hogan templating engine. If it's
JSON, write it directly.


Files and Folders
-----------------

"package.json" in the root folder includes the project name, version, start point, etc. It also
includes all the node.js dependencies that are downloaded and installed when you type "node install",
in the root folder. Most of these are stock Express dependencies except:
- hjs - the Hogan templating system. (Jade is the default, but it has a gross python-like syntax)
- formidible - Used to easily read POST data, especially multipart
- nedb - the "mongo-like" database used in the app


"app.js" file is the real starting point of the app. bin/www just includes app.js, then starts the server.
app.js is where the routes are setup (routes are mappings of URLs to code). Look around line 30 in app.js
to see the routes. More on routes, below.

The /content folder was created by me to be where we keep app specific to the app. Right now it is just an
images file (where the headshots will be kept) and an nedb folder, where the app database is kept (dbase.json).

/node_modules are all the stock node modules installed through "node install". If we do our own node modules,
they would go in here too.

/public is the same as a /MAMP/htdocs (or /var/www/html) in a regular webserver. If an inbound URL does not
match a defined route, the webserver tries to fetch from the public folder. This folder also holds common
files that would be used by content generated through Hogan such as css files, images, included javascript,
etc.

/routes has Node.JS modules that are run when specific URLs are inbound. routes/index.js has only two routes:
the "homepage" (/) and a template test file at /mktest. /routes/ssroutes.js has two routes (right now), one
to upload (/upload) and another to test parameters passed up: /upload/test. The bulk of the code we'll be
writing for the server will be in the routes folder.

/views holds the Hogan template files.
