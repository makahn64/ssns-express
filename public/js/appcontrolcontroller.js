/**
 * This is the Leaderboard controller for the app
 */

app.controller("lbController", function($scope, $http, $interval, $timeout){

    var SERVER_ROOT = "";
    // running on appdelegates.net, need to move root for ProxyPass in httpd.conf
    if (window.location.hostname.indexOf("appdelegates")>0)
        SERVER_ROOT = "/lexus";

    // Time between each slide-in
    $scope.intraAnimationDelay = 250;

    $scope.timing = {
        lbTime: 10000,
        qTime: 10000
    }

    $scope.state = {
        nowShowing: "queue.partial.html",
        mode: "q"
    }

    $scope.hideIdx = 10;

    $scope.isHidden = function(idx){
        return idx < $scope.hideIdx;
    }

    $scope.svrRoot = window.location.hostname + SERVER_ROOT;

    // 10 or less entries
    $scope.leaderboard = [];

    // 18 or less. Spots 18 thru 2.
    $scope.startQueue = [];
    // Next up
    $scope.nextUp = { firstName: "Bad Mutha",
        lastName: "Fucker" };

    // Only here if the client wants to add it
    $scope.onDeck = null;

    $scope.setColor = function(idx){
        if (idx==0)
            return { color: "black"};
        else
            return {color: "white"};
    }

    $scope.refreshStartQueue = function(){

        $http({method: 'GET', url: SERVER_ROOT + '/guests/allqueued'}).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.startQueue = data;
                $scope.nextUp = $scope.startQueue.shift();
                if ($scope.state.mode=="q")
                    $scope.hideIdx = $scope.startQueue.length-1;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };

    $scope.refreshLB = function(){

        $scope.leaderboard = [];
        //$scope.preAnimate();

        $http({method: 'GET', url: SERVER_ROOT + '/guests/leaderboard'}).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.leaderboard = data;
                if ($scope.state.mode=="lb")
                    $scope.hideIdx = $scope.leaderboard.length-1;
                //$scope.postAnimate();
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

    $scope.getTiming = function(){

        $http({method: 'GET', url: SERVER_ROOT + '/guests/lbtiming'}).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.timing = data;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.

                console.log("Problem getting on timing info");
            });
    };


    //$scope.refreshStartQueue();
    /*
    $timeout(function(){
        $scope.refreshLB();
    }, 2000);
    */

    $scope.runAnimation = function(){

        $timeout(function(){
            console.log("Hide index: "+$scope.hideIdx);
            $scope.hideIdx--;
            if ($scope.hideIdx>0)
                $scope.runAnimation();

        }, $scope.intraAnimationDelay);

    }

    $scope.refreshAll = function(){

        $scope.refreshStartQueue();
        $scope.refreshLB();
        $scope.runAnimation();
        $scope.getTiming();
        console.log("Height: "+window.screen.availHeight);
        console.log("Width: "+window.screen.availWidth);

    }

    /*
    $interval(function(){
        $scope.nextUp ="";
        $scope.refreshAll();
    }, 30000);

     */

    $timeout(function(){
        $scope.refreshAll();
    }, 1500);

    $interval(function(){


        if ($scope.state.mode=="q"){
            $scope.state.mode="lb";
            $scope.state.nowShowing="leaders.partial.html"
        } else {
            $scope.hideIdx = 20;
            $scope.nextUp = "";
            $scope.state.mode="q";
            $scope.state.nowShowing="queue.partial.html"
        }


        $scope.refreshAll();

    }, 15000);

});
