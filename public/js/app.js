//Define an angular module for our app
var app = angular.module('ngApp', ["ngAnimate", "angular-gestures"]);

//$( document ).ready(function() {
//
//    // start it up
//    $( "html" ).delay(1000).animate({ opacity: "1" }, 2000);
//
//});
//
//



//MK: Adds file dropzone on element
app.directive('dragAndDrop', [
    '$rootScope', function ($rootScope) {
        return {
            restrict: 'A',
            link: function (scope, elem, attr) {

                elem.bind('dragover', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                });
                elem.bind('dragenter', function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                });
                elem.bind('dragleave', function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                });
                elem.bind('drop', function (e) {

                    var droppedFiles = e.dataTransfer.files;

                    e.stopPropagation();
                    e.preventDefault();

                    if (droppedFiles) {
                        $rootScope.$broadcast('droppedFile', droppedFiles);
                    }


                });

            }
        };
    }]);



app.filter('numberFixedLen', function () {
        return function (n, len) {
            var num = parseInt(n, 10);
            len = parseInt(len, 10);
            if (isNaN(num) || isNaN(len)) {
                return n;
            }
            num = ''+num;
            while (num.length < len) {
                num = '0'+num;
            }
            return num;
        };
    });

app.filter('firstInitial', function () {
    return function (n) {

        var rval = n.charAt(0).toUpperCase()+".";
        return rval;
    };
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


