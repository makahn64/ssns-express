/**
 * This is the Leaderboard controller for the app
 */

app.controller("lbController2", function($scope, $http, $interval, $timeout){

    var SERVER_ROOT = "";
    // running on appdelegates.net, need to move root for ProxyPass in httpd.conf
    if (window.location.hostname.indexOf("appdelegates")>0)
        SERVER_ROOT = "/lexus";


    $scope.svrRoot = window.location.hostname + SERVER_ROOT;

    $scope.leaderboard = [
        { firstName: "", lastName: "", time: "" }, //1
        { firstName: "", lastName: "", time: "" }, //2
        { firstName: "", lastName: "", time: "" }, //3
        { firstName: "", lastName: "", time: "" }, //4
        { firstName: "", lastName: "", time: "" }, //5
        { firstName: "", lastName: "", time: "" }, //6
        { firstName: "", lastName: "", time: "" }, //7
        { firstName: "", lastName: "", time: "" }, //8
        { firstName: "", lastName: "", time: "" }, //9
        { firstName: "", lastName: "", time: "" }  //10
    ];

    $scope.startQueue = [];

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

    //$scope.refreshStartQueue();
    /*
    $timeout(function(){
        $scope.refreshLB();
    }, 2000);
    */

    $scope.runAnimation = function(){

        setTimeout(function(){

            /*
            for (var i=0; i<10; i++){
                $('#cell-'+i).delay(10000-i*1000).show();
            }
            */

            $('#cell-0').fadeOut().delay(4000).fadeIn();
            $('#cell-1').fadeOut().delay(3000).fadeIn();


        }, 500);

    }

    $interval(function(){
        $scope.refreshStartQueue();
        $scope.refreshLB();
        $scope.runAnimation();
    }, 5000);

    $scope.state = {
        nowShowing: "leaders2.partial.html"
    }
});
