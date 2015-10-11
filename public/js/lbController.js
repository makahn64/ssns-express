/**
 * This is the Leaderboard controller for the app
 */

app.controller("lbController", function($scope, $http, $interval, $timeout ){

    var BUILD_SPEED = "oncrack";
    //var BUILD_SPEED = "normal";

    var SERVER_ROOT = "";
    // running on appdelegates.net, need to move root for ProxyPass in httpd.conf
    //if (window.location.hostname.indexOf("appdelegates")>0)
    //    SERVER_ROOT = "/lexus";

    $scope.svrRoot = window.location.hostname + SERVER_ROOT;

    var REFRESH_INTERVAL = 23000;
    if (BUILD_SPEED=='oncrack'){
        REFRESH_INTERVAL = 10000;
    }

    var LEADERBOARD_PATH = "partials/leaderboard.partial.html";
    var VIDEO_PATH = "partials/videoplayer.partial.html";
    var FINAL_ROUND_PATH = "partials/finalround.partial.html";
    var ADMIN_MENU_PATH = "partials/finalround.partial.html";


    $scope.mainWindow = LEADERBOARD_PATH;
    $scope.popupWindow = ""; //partials/popupWindow.partial.html

    // POPUP CONTROL METHODS

    $scope.newGame = function(){
        console.log("New game");
    }

    $scope.finals = function(){
        console.log("Final game");
    }


    //--------------------------------------------------------------

    // initialize animation variables
    $scope.showName = [];
    $scope.showHandDescr = [];
    $scope.showCard = [];

    $scope.showAllNow = function(visible){
        for (var i=0; i<$scope.leaderboard.length; i++){
            $scope.showName[i] = visible;
            $scope.showHandDescr[i] = visible;
            $scope.showCard[i] = [ visible, visible, visible, visible, visible ];

        }
    }

    // Time between each player
    $scope.intraAnimationDelay = 1000;
    if (BUILD_SPEED=='oncrack'){
            $scope.intraAnimationDelay = 500;
    }
    $scope.animationIdx = -1;

    $scope.cardRippleAnimation = function(player, count){
        $scope.showCard[player][count] = true;
        count++;
        if (count<5)
            $timeout(function(){ $scope.cardRippleAnimation(player, count)}, $scope.intraAnimationDelay/5);
    }

    $scope.buildAnimation = function(){

        if ($scope.leaderboard.length==0){

            return; // nothing to animate

        }

        // Check if we are starting from ground zero
        if ($scope.animationIdx < 0){
            $scope.animationIdx = $scope.leaderboard.length - 1;
        }

        $scope.showName[$scope.animationIdx] = true;
        $scope.showHandDescr[$scope.animationIdx] = true;
        var thisGuy = $scope.animationIdx;
        $timeout(function(){ $scope.cardRippleAnimation(thisGuy, 0)}, $scope.intraAnimationDelay/10);


        $scope.animationIdx--;

        if ($scope.animationIdx > -1)
            $timeout($scope.buildAnimation, $scope.intraAnimationDelay);



    }



    // 10 or less entries
    $scope.leaderboard = [];

    $scope.refreshLB = function(){

        // Trigger outtro anim?
        $scope.showAllNow(false);

        $http({method: 'GET', url: SERVER_ROOT + '/players/leaderboard'}).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                $scope.leaderboard = data;
                $scope.showAllNow(false);
                $scope.buildAnimation();

                //$scope.postAnimate();
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };




    $scope.runAnimation = function(){

        $timeout(function(){
            console.log("Hide index: "+$scope.hideIdx);
            $scope.hideIdx--;
            if ($scope.hideIdx>0)
                $scope.runAnimation();

        }, $scope.intraAnimationDelay);

    }




    $interval(function(){
            $scope.refresh();
        }, REFRESH_INTERVAL);


    $scope.refresh = function(){
        $scope.showAllNow(false); // trigger outtro anims
        //was 2000
        $timeout($scope.refreshLB, $scope.intraAnimationDelay*2);
    }

    $scope.animOut = function(){
        $scope.showCard[0] = [false, false, false, false, false];
        $scope.showName[0] = false;
        $scope.showHandDescr[0] = false;
    }

    $scope.refresh();

});
