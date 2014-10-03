/**
 * This is the main controller for the app and does all the real work of switching screens, etc.
 *
 * It initially loads the Loading screen. A $watcher in the controller for the loading screen (loading-controller.js)
 * triggers a call back to this module that segues to the correct opening screen for the app mode.
 */

app.controller("guestController", function($scope, $http, $interval){

    var SERVER_ROOT = "";
    // running on appdelegates.net, need to move root for ProxyPass in httpd.conf
    if (window.location.hostname.indexOf("appdelegates")>0)
        SERVER_ROOT = "/lexus";


    $scope.svrRoot = window.location.hostname + SERVER_ROOT;

    $scope.guests = [];
    $scope.startQueue = [];
    $scope.onDeck = null;
    $scope.score = {
        time: 0
    };

    $scope.ctime = new Date().getTime();


    $scope.newguest = {
        lastName: "",
        firstName: ""
    };

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

    $scope.refreshStartQueue = function(){

        $http({method: 'GET', url: SERVER_ROOT + '/guests/allqueued'}).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.startQueue = data;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };

    $scope.refreshLB = function(){

        $http({method: 'GET', url: SERVER_ROOT + '/guests/leaderboard'}).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.leaderboard = data;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };


    $scope.refreshOnDeck = function(){

        $http({method: 'GET', url: SERVER_ROOT + '/guests/nextup'}).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.onDeck = data.onDeck;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                if (data.result!=undefined){
                    $scope.onDeck = null;
                }
                console.log("Problem getting on deck player");
            });
    };


    $scope.postNewGuest = function(){

        $http({method: 'POST', url: SERVER_ROOT + '/guests/register', data: { data: $scope.newguest }} ).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.newguest = {
                    lastName: "",
                    firstName: ""
                };
                $scope.refreshAllGuests();
             }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log("ERROR: "+data.toString());
            });
    };

    $scope.modifyGuest = function(dbId, action){

        var verb;

        switch(action){
            case 'ENQ':
                verb = "queue";
                break;

            case 'DEQ':
                verb = "dequeue";
                break;

            case 'WL':
                verb = "waitlist";
                break;

            case 'GO':
                verb = "nextup";
                break;


         }

        if (verb){

            $http({method: 'POST', url: SERVER_ROOT + '/guests/'+verb+"/"+dbId } ).
                success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                    $scope.refreshAllGuests();
                    $scope.refreshStartQueue();

                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.log("ERROR: "+data.toString());
                });

        }
    }

    $scope.cleanDB = function(){

        $http({method: 'POST', url: SERVER_ROOT + '/guests/eraseall' } ).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.refreshAllGuests();
                $scope.refreshStartQueue();

            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log("ERROR: "+data.toString());
            });

    };

    $scope.recordTime = function(){

        $http({method: 'POST', url: SERVER_ROOT + '/guests/recordTime/'+$scope.score.time } ).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.refreshAllGuests();
                $scope.refreshStartQueue();

            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log("ERROR: "+data.toString());
            });

    };

    $scope.refreshAllGuests();
    $scope.refreshStartQueue();

    $interval(function(){
        $scope.refreshOnDeck();
        $scope.refreshLB();
        $scope.refreshAllGuests();
        $scope.refreshStartQueue();
        $scope.ctime = new Date().getTime();
    }, 5000);

});
