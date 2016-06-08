
/**
 * Created by jasperkahn on 7/23/14.
 */


function PokerCard (rank, suit) {

    var UNICODE_PRINT_SUITS = false;

    this.validRanks = ["?","A","2","3","4","5","6","7","8","9","T","J","Q","K","A","JO"];

    // Unicode output to console does not work well...

    if (UNICODE_PRINT_SUITS)
        this.validSuits = ["?" ,"♣","♦", "♥", "♠"];
    else
        this.validSuits = ["?", "C", "D", "H", "S"];

    if ( isNaN( parseInt(rank) ) ){
        switch ( rank.toUpperCase() ){
            case "A":
                this.rankNumeric = 14;
                break;
            case "K":
                this.rankNumeric = 13;
                break;
            case "Q":
                this.rankNumeric = 12;
                break;
            case "J":
                this.rankNumeric = 11;
                break;
            case "T":
                this.rankNumeric = 10;
                break;
            default:
                this.rankNumeric =0;
        }
    } else if(rank >= 0 && rank <= 15) {
        this.rankNumeric = rank;
    }
    else{
        this.rankNumeric = 0;
    }

    this.rank = this.validRanks[this.rankNumeric];

    this.suit = suit.toUpperCase();

    this.suitNumeric = ["?", "C", "D", "H", "S"].indexOf(suit.toUpperCase());

    if (this.suitNumeric == -1){
        this.suitNumeric = 0;
    }

    this.rankSuit = this.rank.toString() + this.validSuits[this.suitNumeric];


    this.rankName = function(){

        var rankNames = ["?","Ace","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Jack","Queen","King","Ace","Joker"];
        return rankNames[this.rankNumeric];

    };

    this.suitName = function(){

        var suitNames = ["?", "Clubs", "Diamonds", "Hearts", "Spades"];
        return suitNames[this.suitNumeric];

    };


    this.prettyPrint = function(){

        return this.rankSuit;

    };

    this.prettyPrintFull = function(){

        var fullName = this.rankName() + " of ";
        fullName + this.suitName;
        return fullName;

    }

}

function PokerDeck () {

    this.deck = [];

    this.shuffle = function shuffle(){ //v1.0

        var o = this.deck;

        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x){}

        this.deck = o;
    };

    this.resetDeck = function(){

        this.deck.length = 0;

        for (var suit = 1; suit < 5; suit++){
            for (var rank = 2; rank < 15; rank++){
                var card = new PokerCard(rank, ["?", "C", "D", "H", "S"][suit]);
                this.deck.push(card);
            }
        }

        this.shuffle();

    };

    this.resetDeck();

    this.drawCard = function(){

        return this.deck.pop();

    };

}

// TEST object to force ties

function StackedPokerDeck (numTies) {

    this.deck = [];
    this.numTies = numTies;

    this.shuffle = function shuffle(){ //v1.0

        var o = this.deck;

        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x){}

        this.deck = o;
    };

    this.resetDeck = function(){

        this.deck.length = 0;

        this.deck.push(new PokerCard(11, "H"));
        this.deck.push(new PokerCard(10, "H"));
        this.deck.push(new PokerCard(9, "H"));
        this.deck.push(new PokerCard(5, "S"));
        this.deck.push(new PokerCard(7, "S"));

        for (var i=0; i<this.numTies; i++) {
            this.deck.push(new PokerCard(13, "H"));
            this.deck.push(new PokerCard(12, "H"));
        }

        for (var i=this.numTies; i<10; i++) {
            this.deck.push(new PokerCard(2, "C"));
            this.deck.push(new PokerCard(3, "C"));

        }






    };


    this.drawCard = function(){

        return this.deck.pop();

    }

this.resetDeck();


}

function PokerHand() {

    this.hand = [];
    this.handValue = 0;
    this.bestFiveCardHand = [];
    this.handDescription = "";

    this.rankCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.suitCounts = [0, 0, 0, 0, 0];

    this.highRankOfStraight = 0;
    this.suitOfFlush = 0;
    this.rankOfQuad = 0;
    this.rankOfHighTrip = 0;
    this.rankOfHighPair = 0;
    this.rankOfLowPair = 0;

    this.HandType = {
        NOTHING                 : {value: 0,  name: "Nothing"},
        HIGH_CARD               : {value: 1,  name: " High"},
        PAIR                    : {value: 2,  name: "Pair of "},
        TWO_PAIR                : {value: 3,  name: "Two Pair"},
        THREE_OF_A_KIND         : {value: 4,  name: "Three of a Kind"},
        LOWBALL_STRAIGHT        : {value: 15, name: "Straight"},
        STRAIGHT                : {value: 5,  name: "Straight"},
        FLUSH                   : {value: 6,  name: "Flush"},
        FULL_HOUSE              : {value: 7,  name: "Full House"},
        FOUR_OF_A_KIND          : {value: 8,  name: "Four of a Kind"},
        LOWBALL_STRAIGHT_FLUSH  : {value: 19, name: "Straight Flush"},
        STRAIGHT_FLUSH          : {value: 9,  name: "Straight Flush"}
    };

    this.compareTo = function(otherHand){

        if(otherHand instanceof PokerHand){
            if (this.handValue < otherHand.handValue){
                return 1;
            }
            else if (this.handValue > otherHand.handValue){
                return -1;
            }
            else {
                return 0;
            }
        }

        else{
            return NaN;
        }

    };

    this.sortCards = function(card1, card2){
        if (card1.rankNumeric < card2.rankNumeric){
            return 1;
        }
        else if (card1.rankNumeric > card2.rankNumeric){
            return -1;
        }
        else{
            return 0;
        }
    };

    this.checkForFlush = function(){

        for (var i = 1; i < 5; i++){
            if (this.suitCounts[i] >= 5){
                this.suitOfFlush = i;
                return true;
            }
        }

        return false;

    };

    this.checkForStraight = function(){

        var numConsecutiveCards = 1;
        var previousRank = -1;

        for (var i = 0; i < this.hand.length; i++) {

            var card = this.hand[i];

            if (card.rankNumeric == previousRank - 1){
                numConsecutiveCards++;
            }
            else if (card.rankNumeric != previousRank){
                numConsecutiveCards = 1;
            }

            previousRank = card.rankNumeric;

            if (card.rankNumeric == 2 && numConsecutiveCards ==4){
                var firstCard = this.hand[0];
                if (firstCard.rankNumeric == 14){
                    this.highRankOfStraight = 5;
                    return this.HandType.LOWBALL_STRAIGHT;
                }
            }

            if (numConsecutiveCards == 5){
                this.highRankOfStraight = previousRank + 4;
                return this.HandType.STRAIGHT;
            }

        }

        return this.HandType.NOTHING;

    };

    this.checkForPairs = function(){

        for (var i = 0; i < 15; i++)
        {
            if (this.rankCounts[i] == 4){
                this.rankOfQuad = i;
                return this.HandType.FOUR_OF_A_KIND;
            }
            else if (this.rankCounts[i] == 3){
                if (this.rankOfHighTrip > 0 && this.rankOfHighPair < this.rankOfHighTrip){
                    this.rankOfHighPair = this.rankOfHighTrip;
                }
                this.rankOfHighTrip = i;
            }
            else if (this.rankCounts[i] == 2){
                this.rankOfLowPair = this.rankOfHighPair;
                this.rankOfHighPair = i;
            }
        }

        if (this.rankOfHighTrip > 0){
            if (this.rankOfHighPair > 0){
                return this.HandType.FULL_HOUSE;
            }
            else{
                return this.HandType.THREE_OF_A_KIND;
            }
        }
        else if (this.rankOfHighPair > 0){
            if (this.rankOfLowPair > 0){
                return this.HandType.TWO_PAIR;
            }
            else{
                return this.HandType.PAIR;
            }
        }
        else{
            return this.HandType.NOTHING;
        }

    };

    this.checkForStraightFlush = function(straightType){

        var flushCards = [];

        this.hand.forEach(function(card, index ,array){
            if (card.suitNumeric == this.suitOfFlush) {
                flushCards[flushCards.length] = card;
            }
        }, this);

        var numConsecutiveCards = 1;
        var previousRank = -1;

        for (var i = 0; i < flushCards.length; i++) {

            var card = flushCards[i];

            if (card.rankNumeric == previousRank - 1){
                numConsecutiveCards++;
            }
            else if (card.rankNumeric != previousRank){
                numConsecutiveCards = 1;
            }

            previousRank = card.rankNumeric;

            if (card.rankNumeric == 2 && numConsecutiveCards == 4){
                var firstCard = flushCards[0];
                if (firstCard.rankNumeric == 14){
                    this.highRankOfStraight = 5;
                    return this.HandType.LOWBALL_STRAIGHT_FLUSH;
                }
            }

            if (numConsecutiveCards == 5){
                this.highRankOfStraight = previousRank + 4;
                return this.HandType.STRAIGHT_FLUSH;
            }

        }

        return straightType;

    };

    this.setFinalHand = function(type){

        var finalHand = [];

        switch (type){

            case this.HandType.HIGH_CARD:
            {
                this.hand.forEach(function(card, index ,array){
                    if (finalHand.length < 5) {
                        finalHand.push(card);
                    }
                }, this);
                var highCard = finalHand[0];
                this.handDescription = highCard.rankName() + type.name;

            }
                break;

            case this.HandType.PAIR:
            {
                this.hand.forEach(function(card, index ,arrray){
                    if (card.rankNumeric == this.rankOfHighPair) {
                        finalHand.push(card);
                    }
                }, this);
                var highCard = finalHand[0];
                var plural = (highCard.rankName()=='Six')?"es":"s";
                this.handDescription = type.name + highCard.rankName() + plural;

            }
                break;

            case this.HandType.TWO_PAIR:
            {
                this.hand.forEach(function(card, index ,arrray){
                    if (card.rankNumeric == this.rankOfHighPair || card.rankNumeric == this.rankOfLowPair) {
                        finalHand.push(card);
                    }
                }, this);
                this.handDescription = type.name;

            }
                break;

            case this.HandType.THREE_OF_A_KIND:
            {
                this.hand.forEach(function(card, index ,arrray){
                    if (card.rankNumeric == this.rankOfHighTrip) {
                        finalHand.push(card);
                    }
                }, this);
                this.handDescription = type.name;

            }
                break;

            case this.HandType.LOWBALL_STRAIGHT:
            {
                var nextRank = this.highRankOfStraight;

                this.hand.forEach(function(card, index ,arrray){
                    if (card.rankNumeric == nextRank && finalHand.length < 5) {
                        finalHand.push(card);
                        nextRank--;
                    }
                }, this);
                finalHand.push(this.hand[0]);
                this.handDescription = type.name;

            }
                break;

            case this.HandType.STRAIGHT:
            {
                var nextRank = this.highRankOfStraight;

                this.hand.forEach(function(card, index ,arrray){
                    if (card.rankNumeric == nextRank && finalHand.length < 5) {
                        finalHand.push(card);
                        nextRank--;
                    }
                }, this);
                this.handDescription = type.name;

            }
                break;

            case this.HandType.FLUSH:
            {
                this.hand.forEach(function(card, index ,arrray){
                    if (card.suitNumeric == this.suitOfFlush && finalHand.length < 5) {
                        finalHand.push(card);
                    }
                }, this);
                this.handDescription = type.name
            }
                break;

            case this.HandType.FULL_HOUSE:
            {
                this.hand.forEach(function(card, index ,arrray){
                    if (card.rankNumeric == this.rankOfHighTrip) {
                        finalHand.push(card);
                    }
                }, this);
                this.hand.forEach(function(card, index ,arrray){
                    if (card.rankNumeric == this.rankOfHighPair && finalHand.length < 5) {
                        finalHand.push(card);
                    }
                }, this);
                this.handDescription = type.name;
            }
                break;

            case this.HandType.FOUR_OF_A_KIND:
            {
                this.hand.forEach(function(card, index ,arrray){
                    if (card.rankNumeric == this.rankOfQuad) {
                        finalHand.push(card);
                    }
                }, this);
                this.handDescription = type.name;
            }
                break;

            case this.HandType.LOWBALL_STRAIGHT_FLUSH:
            {
                var nextRank = this.highRankOfStraight;

                this.hand.forEach(function(card, index ,arrray){
                    if (card.rankNumeric == nextRank && card.suitNumeric == this.suitOfFlush && finalHand.length < 5) {
                        finalHand.push(card);
                        nextRank--;
                    }
                }, this);
                finalHand.push(this.hand[0]);
                this.handDescription = type.name;

            }
                break;

            case this.HandType.STRAIGHT_FLUSH:
            {
                var nextRank = this.highRankOfStraight;

                this.hand.forEach(function(card, index ,arrray){
                    if (card.rankNumeric == nextRank && card.suitNumeric == this.suitOfFlush && finalHand.length < 5) {
                        finalHand.push(card);
                        nextRank--;
                    }
                }, this);
                this.handDescription = type.name;

            }
                break;

            default:
                break;
        }

        this.hand.forEach(function(kicker, index ,arrray){
            if (finalHand.length < 5 && finalHand.indexOf(kicker) == -1){
                finalHand.push(kicker);
            }
        }, this);

        this.bestFiveCardHand = finalHand;

    };

    this.calculateHandValue = function(type){

        var value = 10000000 * (type.value % 10);

        this.setFinalHand(type);

        var exponent = 4;

        this.bestFiveCardHand.forEach(function(card, index ,arrray){
            value += (card.rankNumeric * Math.pow(16, exponent));
            exponent--;
        }, this);

        if (type == this.HandType.LOWBALL_STRAIGHT_FLUSH || type == this.HandType.STRAIGHT_FLUSH) {
            console.log(this.printFiveCardHand());
            console.log(this.printFullHand() + "\n");
        }

        return value;

    };

    this.updateHandValue = function(){

        if(this.hand.length < 5)
        {
            this.handValue = 0;
            return;
        }

        this.hand.sort(this.sortCards);

        this.highRankOfStraight = 0;
        this.suitOfFlush = 0;
        this.rankOfQuad = 0;
        this.rankOfHighTrip = 0;
        this.rankOfHighPair = 0;
        this.rankOfLowPair = 0;

        var hasFlush = this.checkForFlush();
        var straightType = this.checkForStraight();
        var pairType = this.checkForPairs();

        if (straightType != this.HandType.NOTHING && hasFlush){
            straightType = this.checkForStraightFlush(straightType);
        }

        if (straightType == this.HandType.STRAIGHT_FLUSH)
        {
            this.handValue = this.calculateHandValue(this.HandType.STRAIGHT_FLUSH);
        }
        else if (straightType == this.HandType.LOWBALL_STRAIGHT_FLUSH)
        {
            this.handValue = this.calculateHandValue(this.HandType.LOWBALL_STRAIGHT_FLUSH);
        }
        else if (pairType == this.HandType.FOUR_OF_A_KIND)
        {
            this.handValue = this.calculateHandValue(this.HandType.FOUR_OF_A_KIND);
        }
        else if (pairType == this.HandType.FULL_HOUSE)
        {
            this.handValue = this.calculateHandValue(this.HandType.FULL_HOUSE);
        }
        else if (hasFlush)
        {
            this.handValue = this.calculateHandValue(this.HandType.FLUSH);
        }
        else if (straightType == this.HandType.STRAIGHT)
        {
            this.handValue = this.calculateHandValue(this.HandType.STRAIGHT);
        }
        else if (straightType == this.HandType.LOWBALL_STRAIGHT)
        {
            this.handValue = this.calculateHandValue(this.HandType.LOWBALL_STRAIGHT);
        }
        else if (pairType == this.HandType.THREE_OF_A_KIND)
        {
            this.handValue = this.calculateHandValue(this.HandType.THREE_OF_A_KIND);
        }
        else if (pairType == this.HandType.TWO_PAIR)
        {
            this.handValue = this.calculateHandValue(this.HandType.TWO_PAIR);
        }
        else if (pairType == this.HandType.PAIR)
        {
            this.handValue = this.calculateHandValue(this.HandType.PAIR);
        }
        else
        {
            this.handValue = this.calculateHandValue(this.HandType.HIGH_CARD);
        }

    };

    this.addCard = function(card){

        if (card instanceof PokerCard){

            this.hand.push(card);

            this.rankCounts[card.rankNumeric] += 1;
            this.suitCounts[card.suitNumeric] += 1;

            this.updateHandValue();
        }

    };

    this.addCards = function(cards){

        if (cards instanceof Array){
            cards.forEach(function(card, index ,arrray){
                this.addCard(card);
            }, this);
        }

    };

    this.printFullHand = function(){

        var handAsString = "[";

        /*
        this.hand.forEach(function(card, index ,arrray){
            handAsString += (card.prettyPrint() + ",");
        }, this);
        */

        this.hand.forEach(function(card){
            handAsString += (card.prettyPrint() + ",");
        });

        handAsString = handAsString.substring(0, handAsString.length - 1) + "]";

        return handAsString;

    };

    this.printFiveCardHand = function(){

        var handAsString = "[";

        this.bestFiveCardHand.forEach(function(card, index ,arrray){
            handAsString += (card.prettyPrint() + ",");
        }, this);

        handAsString = handAsString.substring(0, handAsString.length - 1) + "]";

        return handAsString;

    };

    this.toStringArray = function() {
        var rval = [];
        this.hand.forEach(function(card){
            rval.push(card.prettyPrint());
        });
        return rval;
    };

    this.toStringArray5Card = function() {
        var rval = [];
        this.bestFiveCardHand.forEach(function(card){
            rval.push(card.prettyPrint());
        });
        return rval;
    }

}

function testJakPokerSpecificHand(){

    var hand = new PokerHand();
    hand.addCard(new PokerCard(10, "c"));
    hand.addCard(new PokerCard(9, "h"));
    hand.addCard(new PokerCard(8, "c"));
    hand.addCard(new PokerCard(7, "c"));
    hand.addCard(new PokerCard(6, "c"));
    hand.addCard(new PokerCard(5, "c"));
    hand.addCard(new PokerCard(4, "c"));

}

function testJakPoker(){

    var noWeirdGames = true;
    var numGames = 0;

    while (noWeirdGames && numGames < 1000) {

        numGames++;

        if (numGames % 10000 == 0) {
            console.log("Game Number: " + numGames);
        }

        var deck = new PokerDeck();

        var players = [10];

        for (var i = 0; i < 10; i++) {
            players[i] = new PokerHand();
            players[i].addCard(deck.drawCard());
            players[i].addCard(deck.drawCard());
        }

        var flop1 = deck.drawCard();
        var flop2 = deck.drawCard();
        var flop3 = deck.drawCard();
        var turn = deck.drawCard();
        var river = deck.drawCard();

        for (var i = 0; i < 10; i++) {
            players[i].addCard(flop1);
            players[i].addCard(flop2);
            players[i].addCard(flop3);
            players[i].addCard(turn);
            players[i].addCard(river);
        }

        var bestHandValue = 0;
        var bestHandDescription = "";
        var numberOfWinners = 0;

        for (var i = 0; i < 10; i++) {
            if (players[i].handValue > bestHandValue) {
                numberOfWinners = 1;
                bestHandValue = players[i].handValue;
                bestHandDescription = players[i].handDescription;
            }
            else if (players[i].handValue == bestHandValue) {
                numberOfWinners++;
            }
        }

        if (numberOfWinners > 4 && numberOfWinners < 10) {

            console.log("Number of Winners: " + numberOfWinners);
            console.log("Winning Hand: " + bestHandDescription);
            console.log("Hand Value: " + bestHandValue + "\n");
            for (var i = 0; i < 10; i++) {

                if (players[i].handValue == bestHandValue) {
                    console.log("Player " + i + ": " + players[i].toStringArray());
                }
                else {
                    console.log("Player " + i + ": " + players[i].toStringArray() + "*");
                }

            }

            noWeirdGames = false;

        }

    }
    /*
    var jasperJones = new PokerHand();
    var kimJong = new PokerHand();

    jasperJones.addCard(new PokerCard(9, "h"));
    jasperJones.addCard(new PokerCard(8, "c"));
    jasperJones.addCard(new PokerCard(7, "s"));
    jasperJones.addCard(new PokerCard(4, "h"));
    jasperJones.addCard(new PokerCard(7, "h"));
    jasperJones.addCard(new PokerCard(8, "s"));
    jasperJones.addCard(new PokerCard(8, "h"));

    kimJong.addCard(new PokerCard(8, "d"));
    kimJong.addCard(new PokerCard(7, "c"));
    kimJong.addCard(new PokerCard(7, "s"));
    kimJong.addCard(new PokerCard(4, "h"));
    kimJong.addCard(new PokerCard(7, "h"));
    kimJong.addCard(new PokerCard(8, "s"));
    kimJong.addCard(new PokerCard(8, "h"));

    console.log("Jasper Jones: " + jasperJones.handValue);
    console.log("Kim Jong: " + kimJong.handValue);
*/

    /*
    var deck = new PokerDeck();

    var hand1 = new PokerHand();
    hand1.addCard(deck.drawCard());
    hand1.addCard(deck.drawCard());

    var hand2 = new PokerHand();
    hand2.addCard(deck.drawCard());
    hand2.addCard(deck.drawCard());

    for (var i = 0; i < 5; i++){
        var newCard = deck.drawCard();
        hand1.addCard(newCard);
        hand2.addCard(newCard);
    }

    console.log("\nPlayer 1:\nFull Hand: " + hand1.printFullHand() + "\nBest Hand: " + hand1.printFiveCardHand() + "\nValue:" + hand1.handValue);
    console.log("\nPlayer 2:\nFull Hand: " + hand2.printFullHand() + "\nBest Hand: " + hand2.printFiveCardHand() + "\nValue:" + hand2.handValue);

    if (hand1.compareTo(hand2) > 0){
        console.log("\nPlayer 2 Wins");
    }
    else if (hand1.compareTo(hand2) < 0){
        console.log("\nPlayer 1 Wins");
    }
    else{
        console.log("\nTie");
    }
    */
}

function PokerPlayer(name, dbid){

    this.hand = new PokerHand();
    this.name = name;
    this.dbid = dbid;
    this.isMucked = false;

    this.muck = function(trueFalse){
        this.isMucked = trueFalse;
    }

    this.toggleMuck = function(){
        this.isMucked = !this.isMucked;
    }

    this.handValue = function(){
        if (this.isMucked){
            return 0;
        } else {
            return this.hand.handValue;
        }
    }
}

//testJakPoker();






