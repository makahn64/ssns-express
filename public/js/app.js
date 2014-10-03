//Define an angular module for our app
var app = angular.module('ngApp', ["ngAnimate", "angular-gestures"]);
var gui = require('nw.gui');
var playlistsLoaded = false;
var reloading = false;
var appScope, playbackScope, modalScope, bsPlaybackScope;

// Process is a global node.js object



process.on('uncaughtException', function (err) {         
    // restart app here
    console.log(err);

});


$( document ).ready(function() {

    // start it up
    $( "html" ).delay(1000).animate({ opacity: "1" }, 2000);

});



/*
*
*  FACTORIES GO HERE...?
*   NOTE! All of the downloading and caching factories are in network-cache-factories.js
*/



Array.prototype.clear = function() {
  while (this.length > 0) {
    this.pop();
  }
};

Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};

Array.prototype.remove = function(obj) {
    var i = this.indexOf(obj);
    if (i != -1) {
        this.splice(i, 1);
    }
};


