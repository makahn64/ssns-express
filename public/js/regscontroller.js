/**
 * This is the main controller for the app and does all the real work of switching screens, etc.
 *
 * It initially loads the Loading screen. A $watcher in the controller for the loading screen (loading-controller.js)
 * triggers a call back to this module that segues to the correct opening screen for the app mode.
 */

app.controller("regsController", function($scope, $http, $interval){

    var SERVER_ROOT = "";
    // running on appdelegates.net, need to move root for ProxyPass in httpd.conf
    if (window.location.hostname.indexOf("appdelegates")>0)
        SERVER_ROOT = "/lexus";


    $scope.svrRoot = window.location.hostname + SERVER_ROOT;

    $scope.guests = [];


    $scope.refreshAllGuests = function(){

        $http({method: 'GET', url: SERVER_ROOT + '/guests/allguests'}).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.guests = data;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };


    $scope.refreshAllGuests();

});
