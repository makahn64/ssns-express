/**
 * This is the Leaderboard controller for the app
 */

app.controller("appControlController", function($scope, $http, $interval, $timeout){

    var SERVER_ROOT = "";
    // running on appdelegates.net, need to move root for ProxyPass in httpd.conf
    //if (window.location.hostname.indexOf("appdelegates")>0)
    //    SERVER_ROOT = "/nissan";

    var clearArmed = false;

    $scope.hideSim = true;

    $scope.clearLBButtonText = "Clear Leaderboard (Must Tap Twice)";

    $scope.clearLB = function(){

        if (clearArmed==false){
            $scope.clearLBButtonText = "Clear Leaderboard (TAP TO CONFIRM)";
            $timeout(function(){
                clearArmed = false;
                $scope.clearLBButtonText = "Clear Leaderboard (Must Tap Twice)";
            }, 10000);
            clearArmed = true;
        } else {
            // do clear

            $http({method: 'POST', url: SERVER_ROOT + '/players/clearlb'}).
                success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                    $scope.refreshLB();
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });
        }
    }

    $scope.numWinners = [0,0,0,0,0,0,0,0,0,0];
    $scope.numberOfHandsRun = 0;
    $scope.players = [];

    function checkBestHand(){

        // Figure out who is in the lead.

        // Set them all to in the lead
        var highScore = 0;

        for (var i=0; i<$scope.players.length; i++){
            if ( $scope.players[i].handValue() > highScore ){
                highScore = $scope.players[i].handValue();
            }
        }

        var winners = 0;

        for (var i=0; i<$scope.players.length; i++){

            if (highScore==$scope.players[i].handValue()){
                winners++;
            }
        }

        if (winners>4 && winners<10) {
            for (var i=0; i<$scope.players.length; i++){
                console.log("Player: "+i);
                console.log($scope.players[i].hand.toStringArray());
            }
        }

        $scope.numWinners[winners-1]++;

    }

    $scope.runSim = function(){

        if ($scope.numberOfHandsRun<100000){

            $scope.players = [];
            var deck = new PokerDeck();
            var shared = [ deck.drawCard(), deck.drawCard(), deck.drawCard(), deck.drawCard(),deck.drawCard() ];
            for (var i=0; i<10; i++){
                $scope.players[i] = new PokerPlayer(i, 0);
                // pull hole cards
                $scope.players[i].hand.addCards([deck.drawCard(), deck.drawCard()]);
                // add board
                $scope.players[i].hand.addCards(shared);
            }
            checkBestHand();
            $scope.numberOfHandsRun++;
            $timeout($scope.runSim, 1);
        }

    }

    $scope.generateRandomPlayers = function(){

        function getRandomName(){
            var fNames = ["Fred", "Jane", "Bill", "Sally", "Hank", "Krissy", "Jasper",
                "Jill", "Owen", "Heather", "Vivek", "Raj", "Gunther", "Arnold", "Bubba", "C.J",
                "Jasmine", "Franz", "Hans", "Keiko", "Juan", "Guillermo", "Anthony", "Kim"];
            var lNames = ["Armmisen", "Doe", "Cooper", "Struthers", "Aaron", "Thornton", "Jones", "Jameson",
                "Figgle", "Graham", "Kim", "Jong", "Leutter", "Pal", "Debujyoti", "Gupta", "Tashimura", "Merkel"];
            return { firstName: fNames[Math.floor(Math.random() * fNames.length)],
                lastName: lNames[Math.floor(Math.random() * lNames.length)]};
        }

        console.log("Generating...");

        for (var p=0; p<10; p++){

            var deck = new PokerDeck();
            var hand = new PokerHand();

            for (var i=0; i<7; i++){
                hand.addCard(deck.drawCard());
            }

            var zed = hand.handValue;

            var player = {
                name: getRandomName(),
                hand: hand.toStringArray5Card(),
                score: zed,
                description: hand.handDescription
            };

            var j = JSON.stringify(player);

            $http({method: 'POST', url: SERVER_ROOT + '/players/register', data: player}).
                success(function(data, status, headers, config) {

                    console.log("Cool!");
                    $scope.refreshLB();
                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

        }


    }

    $scope.refreshLB = function(){

        $scope.leaderboard = [];
        //$scope.preAnimate();

        $http({method: 'GET', url: SERVER_ROOT + '/players/leaderboard'}).
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


    $scope.clearPlayer = function(id){

        $http({method: 'POST', url: SERVER_ROOT + '/players/archive/'+id}).
            success(function(data, status, headers, config) {

                console.log("Cool!");
                $scope.refreshLB();
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log("Failed archiving: "+id);

            });


    }


    $scope.refreshLB();


});
