/**
 * This is the Leaderboard controller for the app
 */

app.controller("topController", function($scope, $http, $interval, $timeout ){

    var SERVER_ROOT = "";
    // running on appdelegates.net, need to move root for ProxyPass in httpd.conf
    //if (window.location.hostname.indexOf("appdelegates")>0)
    //    SERVER_ROOT = "/lexus";

    $scope.svrRoot = window.location.hostname + SERVER_ROOT;

    var REFRESH_INTERVAL = 30000;

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

    $scope.currentBackground = "images/Leaderboard.png";

    $scope.logoClicked = function(){
        console.log("Doink!");
        // This should toggle the popup menu //

        if ($scope.mainWindow==LEADERBOARD_PATH){
            $scope.mainWindow = FINAL_ROUND_PATH;
            $scope.currentBackground = "images/FinalHand_BG_noftr.png";
        } else {
            $scope.mainWindow = LEADERBOARD_PATH;
            $scope.currentBackground = "images/Leaderboard.png";

        }
    }


});
