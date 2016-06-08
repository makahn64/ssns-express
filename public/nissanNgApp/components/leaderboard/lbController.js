/**
 * This is the Leaderboard controller for the app
 */

app.controller( "lbController", function ( $scope, $timeout, $log, lbService, $state ) {


    var SHOW_VIDEO_AFTER_SECONDS = 5*60; // 5 minutes
    var _goToVideoNow = false;

    //var BUILD_SPEED = "oncrack";
    var BUILD_SPEED = "normal";

    // Time between each player appearing
    var INTRA_ANIMATION_DELAY = 1000;
    var REFRESH_INTERVAL = 23000;
    var LB_SLEEP_INTERVAL = 5000;

    if ( BUILD_SPEED == 'oncrack' ) {
        REFRESH_INTERVAL = 10000;
        INTRA_ANIMATION_DELAY = 500; // was 500
    }

    $scope.animationIdx = -1;

    var refreshCount = 0;

    // initialize animation variables
    $scope.showName = [];
    $scope.showHandDescr = [];
    $scope.showCard = [];

    function showAllNow( visible ) {
        for ( var i = 0; i < $scope.leaderboard.length; i++ ) {
            $scope.showName[ i ] = visible;
            $scope.showHandDescr[ i ] = visible;
            $scope.showCard[ i ] = [ visible, visible, visible, visible, visible ];

        }
    }

    function animOut() {
        $scope.showCard[ 0 ] = [ false, false, false, false, false ];
        $scope.showName[ 0 ] = false;
        $scope.showHandDescr[ 0 ] = false;
    }

    function cardRippleAnimation( player, count ) {
        $scope.showCard[ player ][ count ] = true;
        count++;
        if ( count < 5 )
            $timeout( function () { cardRippleAnimation( player, count )}, INTRA_ANIMATION_DELAY / 5 );
    }

    $scope.$on( "lb:change", function () {

        $log.debug( "lbController: received notification lb changed. While this is interesting, I will get to it on next wrap." );

    } )

    // Gets run once for each of 10 or less entries
    // Last bit of anim triggers LB change check!
    function buildAnimation() {

        if ( $scope.leaderboard.length == 0 ) {
            //11-11 fix
            $timeout( checkLBForChanges, 5000 );
            return; // nothing to animate

        }

        // Check if we are starting from ground zero
        if ( $scope.animationIdx < 0 ) {
            $scope.animationIdx = $scope.leaderboard.length - 1;
        }

        $scope.showName[ $scope.animationIdx ] = true;
        $scope.showHandDescr[ $scope.animationIdx ] = true;
        var thisGuy = $scope.animationIdx;
        $timeout( function () { cardRippleAnimation( thisGuy, 0 )}, INTRA_ANIMATION_DELAY / 10 );


        $scope.animationIdx--;

        if ( $scope.animationIdx > -1 )
            $timeout( buildAnimation, INTRA_ANIMATION_DELAY );
        else {
            if (_goToVideoNow){
                $log.info( "lbController: now for a word from our sponsor." );
                $state.go('video');
            } else {
                $log.info( "lbController: Leaderboard build complete. Sleeping before refreshing." );
                $timeout( checkLBForChanges, LB_SLEEP_INTERVAL );

            }
        }


    }

    // 10 or less entries
    $scope.leaderboard = [];


    function checkLBForChanges() {

        $scope.leaderboard = lbService.getLeaderboard();

        //trigger outro
        showAllNow( false );

        $timeout( buildAnimation, 1500 );


    }

    $scope.refreshLB = function () {

        // Trigger outtro anim?
        showAllNow( false );


    };


    $scope.runAnimation = function () {

        $timeout( function () {
            console.log( "Hide index: " + $scope.hideIdx );
            $scope.hideIdx--;
            if ( $scope.hideIdx > 0 )
                runAnimation();

        }, INTRA_ANIMATION_DELAY );

    }

    $scope.logoClicked = function(){
        $state.go("ft");
    }

    $timeout( function(){
        _goToVideoNow = true;
    }, SHOW_VIDEO_AFTER_SECONDS*1000);

    checkLBForChanges();

} )
;
