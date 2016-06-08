/**
 * This is the Final Table controller for the app
 */

app.controller("gameController", function($scope, $state, lbService, $interval, $timeout, $log ){

    var numberOfWinners = 0;
    var tiedPlayersIdx = [];
    var cardFlipTime = 140;
    var bitWhoreWinDelayTime = 5000;

    var testTies = false;

    function convertPokerCardToSrc(card){
        var txtCard = card.prettyPrint().toLowerCase();
        var srcHalfCard = "images/Cards_Half/"+txtCard.substring(0,1)+"_"+txtCard.substring(1,2)+".png";
        var srcFullCard = "images/Cards_Big/Cards_Big_"+txtCard+".png";
        return {full: srcFullCard, half: srcHalfCard};
    }

    function checkBestHand(){

        // Figure out who is in the lead.

        // Set them all to in the lead
        var highScore = 0;

        for (var i=0; i<$scope.players.length; i++){
           if ( $scope.players[i].handValue() > highScore ){
               highScore = $scope.players[i].handValue();
           }
        }

        numberOfWinners = 0;
        tiedPlayersIdx = [];

        for (var i=0; i<$scope.players.length; i++){
            $scope.viewAdapter[i].isHighlighted = false;

            if (highScore==$scope.players[i].handValue()){
                $scope.viewAdapter[i].isHighlighted = true;
                $scope.handDescription = $scope.players[i].hand.handDescription;
                numberOfWinners++;
                tiedPlayersIdx.push(i);
            }
        }

    }

    // Prevent the flash of blank cards at the opening.
    // ng-cloak did not work, so this is probably an execution time issue
    $scope.tableClass = 'invisible';

    $scope.showOverlay = false;
    $scope.winnerName = "";
    $scope.isTheWinner = "is the winner!";

    $scope.returnClicked = function(){
        console.log("Beep beep!");
    }

    var deck;


    $scope.seatPlayers = function(){

        $scope.players = [];
        $scope.viewAdapter = [];

        var numPlayers = $scope.leaderboard.length;
        for (var i=0; i<numPlayers; i++){
            $scope.players[i] = new PokerPlayer($scope.leaderboard[i].name.firstName+" "+
                $scope.leaderboard[i].name.lastName, $scope.leaderboard[i]._id);

            $scope.viewAdapter[i] = {
                firstCard: "",
                secondCard: "",
                isHighlighted: false,
                isMucked: false,
                name: $scope.leaderboard[i].name.firstName+" "+
                    $scope.leaderboard[i].name.lastName,
                showFirstCard: false,
                showSecondCard: false,
                showNamePlaque: true
            }
        }

        $scope.tableClass = '';
    }

    function showFirstCard(va){
        return function(){
            va.showFirstCard = true;
        }
    }

    function showSecondCard(va){
        return function(){
            va.showSecondCard = true;
        }
    }

    $scope.animateHoleCards = function(){

        for (var i=0; i<$scope.players.length; i++){

            $timeout(showFirstCard($scope.viewAdapter[i]), 250+100*i);

            $timeout(showSecondCard($scope.viewAdapter[i]), 1250+100*i);

        }
    }

    $scope.dealHoleCards = function(){

        for (var i=0; i<$scope.players.length; i++){
            if ($scope.players[i].isMucked) {
                $scope.viewAdapter[i].firstCard = "images/clearbutton.png";
                $scope.viewAdapter[i].secondCard = "images/clearbutton.png";
                continue; // no cards for U!
            }

            $scope.players[i].hand.addCard(deck.drawCard());
            $scope.players[i].hand.addCard(deck.drawCard());
            $scope.viewAdapter[i].firstCard = convertPokerCardToSrc($scope.players[i].hand.hand[0]).half;
            $scope.viewAdapter[i].secondCard = convertPokerCardToSrc($scope.players[i].hand.hand[1]).half;
        }

        $scope.animateHoleCards();
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
    $scope.animationIdx = -1;

    $scope.cardRippleAnimation = function(player, count){
        $scope.showCard[player][count] = true;
        count++;
        if (count<5)
            $timeout(function(){ $scope.cardRippleAnimation(player, count)}, 200);
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
        $timeout(function(){ $scope.cardRippleAnimation(thisGuy, 0)}, 100);


        $scope.animationIdx--;

        if ($scope.animationIdx > -1)
            $timeout($scope.buildAnimation, $scope.intraAnimationDelay);



    }


    $scope.startGame = function(){

        // Animation vars to control flop a,b,c, turn, river
        $scope.flopInAnim =  [ false, false, false, false, false];
        $scope.flopOutAnim = [ false, false, false, false, false];
        $scope.handDescription = "";
        $scope.hideDealButton = false;

        $scope.state = "predeal";

        $scope.flopA = $scope.flopB = $scope.flopC = $scope.turn = $scope.river = "images/Cards_Big/Cards_Big_Back.png";

        if ((testTies==true)){
            deck = new StackedPokerDeck(3);
        } else {
            deck = new PokerDeck();
        }
        $scope.seatPlayers();
    }

    // 10 or less entries
    $scope.leaderboard = [];

    $scope.refreshLB = function(){


        $scope.showAllNow(false);
        $scope.leaderboard = lbService.getLeaderboard();
        $timeout($scope.startGame, 500);

    };

    $scope.recordWinner = function(player){

        // Trigger outtro anim?
        lbService.recordWinner(player)
            .then( function(){
                $log.debug("Winner recorded in DB");
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


    $scope.nextRound = function(){

        switch($scope.state){
            case "predeal":
                $scope.dealHoleCards();
                $scope.state = "deal";
                break;
            case "deal":

                $scope.state = "flop";
                var cardA = deck.drawCard();
                var cardB = deck.drawCard();
                var cardC = deck.drawCard();

                for (var i=0; i<$scope.players.length; i++)
                    $scope.players[i].hand.addCards([cardA, cardB, cardC]);

                $scope.flopOutAnim[0] = true;

                $timeout(function(){
                    $scope.flopA = convertPokerCardToSrc(cardA).full;
                    //$scope.flopOutAnim[0] = false;
                    $scope.flopInAnim[0] = true;
                    $scope.flopOutAnim[1] = true;
                }, cardFlipTime);

                $timeout(function() {
                    $scope.flopB = convertPokerCardToSrc(cardB).full;
                    //$scope.flopOutAnim[1] = false;
                    $scope.flopInAnim[1] = true;
                    $scope.flopOutAnim[2] = true;
                }, cardFlipTime*2);

                $timeout(function() {
                    $scope.flopC = convertPokerCardToSrc(cardC).full;
                    //$scope.flopOutAnim[2] = false;
                    $scope.flopInAnim[2] = true;
                    checkBestHand();

                }, cardFlipTime*3);

                break;
            case "flop":
                var turnc = deck.drawCard();
                for (var i=0; i<$scope.players.length; i++)
                    $scope.players[i].hand.addCard(turnc);

                $scope.flopOutAnim[3] = true;
                $timeout(function() {
                    $scope.turn = convertPokerCardToSrc(turnc).full;
                    $scope.flopOutAnim[3] = false;
                    $scope.flopInAnim[3] = true;
                    checkBestHand();

                }, cardFlipTime);

                $scope.state = "turn";
                break;
            case "turn":
                var riv = deck.drawCard();
                for (var i=0; i<$scope.players.length; i++)
                    $scope.players[i].hand.addCard(riv);

                $scope.flopOutAnim[4] = true;
                $timeout(function() {
                    $scope.river = convertPokerCardToSrc(riv).full;
                    $scope.flopOutAnim[4] = false;
                    $scope.flopInAnim[4] = true;
                    $scope.hideDealButton = true;

                    $timeout(function(){
                        $scope.showOverlay = true;

                        if (numberOfWinners==1){
                            $scope.winnerName = $scope.players[tiedPlayersIdx[0]].name;
                            $scope.isTheWinner = "is the winner!";
                            $scope.state = "done";
                            $scope.recordWinner($scope.players[tiedPlayersIdx[0]]);

                        } else {
                            $scope.winnerName = "It's a Tie!";
                            $scope.isTheWinner = "Tap Screen to Start Playoff";
                            $scope.state = "playoff";
                        }
                    }, bitWhoreWinDelayTime);

                }, cardFlipTime);

                $scope.state = "river";
                checkBestHand();

                break;

        }

    }

    function doPlayoff(){
        // tied players indexes are in tiedPlayerIdx
        nxtRound = [];
        for (var i=0; i<tiedPlayersIdx.length; i++){
            nxtRound.push($scope.leaderboard[tiedPlayersIdx[i]]);
        }

        $scope.leaderboard = nxtRound;
        $scope.showOverlay = false;
        $timeout($scope.startGame, 500);


    }

    $scope.muckPlayer = function(idx){

        if ($scope.state != "predeal")
            return;

        $scope.players[idx].toggleMuck();

        if ($scope.players[idx].isMucked){
            //$scope.viewAdapter[idx].name = "MUCKED";
            $scope.viewAdapter[idx].isMucked = true;
        } else {
            //$scope.viewAdapter[idx].name = $scope.players[idx].name;
            $scope.viewAdapter[idx].isMucked = false;
        }

    }

    $scope.tappedOverlay = function() {

        switch ($scope.state){
            case 'playoff':
                // OK, we are in a playoff, bitches!
                console.log("Playoff initiated.");
                doPlayoff();
                break;
            case 'done':
                $scope.showOverlay = false;
                $scope.showOutroOverlay = true;
                break
        }


    }

    $scope.clearAndExit = function(){

        lbService.clearLeaderboard()
            .finally( function(){
                $state.go('lb')
            });


    }

    $scope.justExit = function(){
        $state.go('lb');
    }

    $scope.refreshLB();



});
