/**
 * This is the main controller for the app and does all the real work of switching screens, etc.
 *
 * It initially loads the Loading screen. A $watcher in the controller for the loading screen (loading-controller.js)
 * triggers a call back to this module that segues to the correct opening screen for the app mode.
 */

app.controller("appController", function($scope, $interval, $timeout, $q, GameEngine, SettingsService, WebServer){

    var LEADERBOARD_PATH = "partials/leaderboard.partial.html";
    var VIDEO_PATH = "partials/videoplayer.partial.html";
    var FINAL_ROUND_PATH = "partials/finalround.partial.html";
    var ADMIN_MENU_PATH = "partials/finalround.partial.html";

    console.log("Webserver running on port: "+WebServer.getPort());

    $scope.mainWindow = FINAL_ROUND_PATH;
    $scope.popupWindow = "partials/popupWindow.partial.html";

    $scope.players = [];
    SettingsService.getSettingsFromFile().then(
        function(settings){
            $scope.appSettings = settings;
        }
    )


    $scope.minutes = 59;

    $interval(function(){
        $scope.minutes--;
        if ($scope.minutes == -1)
            $scope.minutes = 59;

    }, 1000);

    $scope.tableStyler = function(index){


        var rval = "player_holder ";
        if (index%2)
            rval = rval + "odd ";
        else
            rval = rval + "even ";

        if (index-5>0)
            rval = rval + "fr";
        else
            rval = rval + "fl";

        console.log("Index "+index+" class: "+rval);
        return rval;


    }


    $scope.getTable = function(){

        var rval = [];
        var numRows = 5;

        for (var i=0; i<numRows; i++){
            var entry = { left: {
                            name: "",
                            position: "",
                            hand: ""},
                         right: {
                             name: "",
                             position: "",
                             hand: ""}
            };

            if ($scope.players[i]!=null){
                entry.left.name = $scope.players[i].name;
                entry.left.hand = $scope.players[i].hand;
                entry.left.position = i+1;
            }

            if ($scope.players[i+numRows]!=null){
                entry.right.name = $scope.players[i+numRows].name;
                entry.right.hand = $scope.players[i+numRows].hand;
                entry.right.position = i+6;

            }

            //console.log('...........' + entry);
            rval.push(entry);

        }

        return rval;
    }

    $scope.playerTable = $scope.getTable();

    $scope.logoClicked = function(){
        console.log("Click!");

        if ($scope.mainWindow==LEADERBOARD_PATH)
            $scope.mainWindow = FINAL_ROUND_PATH;
        else
            $scope.mainWindow = LEADERBOARD_PATH;

        $scope.appSettings.mode = $scope.appSettings.mode + "-d-";
        SettingsService.setSettings($scope.appSettings);

    }

    $scope.refreshLb = function(){
        GameEngine.getTop10().then(
            function(data){
                $scope.players = data;
                $scope.playerTable = $scope.getTable();
                console.log("New player data loaded!");
            },
            function(error){
                console.log("Error getting top 10: "+error);
            }
        );
    }

    $timeout( function(){
        $scope.refreshLb();
    }, 1500 );

    $scope.$on('updateLeaderboard', function(e){
        $scope.refreshLb();
    });

    $scope.newGame = function(){
        GameEngine.newGame();
        $scope.appSettings = SettingsService.getSettings();

    }

    testJakPoker();

});
