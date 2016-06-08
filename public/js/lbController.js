/**
 * This is the Leaderboard controller for the app
 */

app.controller( "lbController", function ( $scope, $http, $interval, $timeout, $log ) {

    // 15 seconds per build, 4 per minute, 20/4 = 5 minutes
    // 11-11 client wants 15 minutes, 60 is the number.
    var VID_TO_LB_RATIO = 4 * 15;

    //var BUILD_SPEED = "oncrack";
    var BUILD_SPEED = "normal";

    var SERVER_ROOT = "";
    // running on appdelegates.net, need to move root for ProxyPass in httpd.conf
    //if (window.location.hostname.indexOf("appdelegates")>0)
    //    SERVER_ROOT = "/lexus";

    $scope.svrRoot = window.location.hostname + SERVER_ROOT;

    // Time between each player appearing
    var INTRA_ANIMATION_DELAY = 1000;
    var REFRESH_INTERVAL      = 23000;
    var LB_SLEEP_INTERVAL     = 5000;

    if ( BUILD_SPEED == 'oncrack' ) {
        REFRESH_INTERVAL      = 10000;
        INTRA_ANIMATION_DELAY = 500; // was 500
    }

    var lbChanged = true;
    var lbState   = 'lb'; //options are lb and vid

    $scope.animationIdx = -1;

    var refreshCount = 0;

    var LEADERBOARD_PATH = "partials/leaderboard.partial.html";
    var VIDEO_PATH       = "partials/videoplayer.partial.html";
    var FINAL_ROUND_PATH = "partials/finalround.partial.html";
    var ADMIN_MENU_PATH  = "partials/finalround.partial.html";

    //The getElemById bit here is a dirty hack. Should do a directive, but fuck it,
    //this job is a zombie and I'll I got is a shovel.
    $scope.vid = { src: '/vids/attract.mp4', show: false, elem: document.getElementById( "vid" ) };

    $scope.vid.elem.addEventListener( "ended", function () {
        $log.info( ':::::::::> VIDEO ENDED <::::::::::' );
        $scope.vid.show = false;
        //checkLBForChanges();
    } );

    $scope.mainWindow  = LEADERBOARD_PATH;
    $scope.popupWindow = ""; //partials/popupWindow.partial.html

    // POPUP CONTROL METHODS

    $scope.newGame = function () {
        console.log( "New game" );
    }

    $scope.finals = function () {
        console.log( "Final game" );
    }


    //--------------------------------------------------------------

    // initialize animation variables
    $scope.showName      = [];
    $scope.showHandDescr = [];
    $scope.showCard      = [];

    function showAllNow( visible ) {
        for ( var i = 0; i < $scope.leaderboard.length; i++ ) {
            $scope.showName[ i ]      = visible;
            $scope.showHandDescr[ i ] = visible;
            $scope.showCard[ i ]      = [ visible, visible, visible, visible, visible ];

        }
    }

    function animOut() {
        $scope.showCard[ 0 ]      = [ false, false, false, false, false ];
        $scope.showName[ 0 ]      = false;
        $scope.showHandDescr[ 0 ] = false;
    }

    function cardRippleAnimation( player, count ) {
        $scope.showCard[ player ][ count ] = true;
        count++;
        if ( count < 5 )
            $timeout( function () { cardRippleAnimation( player, count )}, INTRA_ANIMATION_DELAY / 5 );
    }

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

        $scope.showName[ $scope.animationIdx ]      = true;
        $scope.showHandDescr[ $scope.animationIdx ] = true;
        var thisGuy                                 = $scope.animationIdx;
        $timeout( function () { cardRippleAnimation( thisGuy, 0 )}, INTRA_ANIMATION_DELAY / 10 );


        $scope.animationIdx--;

        if ( $scope.animationIdx > -1 )
            $timeout( buildAnimation, INTRA_ANIMATION_DELAY );
        else {
            $log.info( "Leaderboard build complete. Sleeping before refreshing." );
            $timeout( checkLBForChanges, LB_SLEEP_INTERVAL );
        }


    }


    // 10 or less entries
    $scope.leaderboard = [];

    function muteAudio() {

        $scope.vid.elem.volume = $scope.vid.elem.volume * 0.9;
        if ( $scope.vid.elem.volume < 0.1 ) {
            $scope.vid.elem.volume      = 0;
            $scope.vid.elem.pause();
            $scope.vid.elem.currentTime = 0; //rewind

        } else {
            $timeout( muteAudio, 100 );
        }

    }


    $scope.die = function () {

        $log.info( "Video tapped." );
        $scope.vid.show = false;
        muteAudio(); // shutdown video
        lbState = 'lb';

    }


    function checkLBForChanges() {

        refreshCount++;

        $http( { method: 'GET', url: SERVER_ROOT + '/players/leaderboard' } )
            .then( function ( dobj ) {

                var data = dobj.data; //Angular deprecation
                $log.debug( "Checking leaderboard for changes." );

                var lbChanged = data.length != $scope.leaderboard.length;

                if ( !lbChanged ) {
                    for ( var idx = 0; idx < data.length; idx++ ) {
                        if ( data[ idx ]._id != $scope.leaderboard[ idx ]._id ) {
                            lbChanged = true;
                            break;
                        }
                    }
                }

                if ( lbChanged ) {
                    $log.info( "Leaderboard change detected!" );
                    $scope.leaderboard = data;
                }

                //trigger outro
                showAllNow( false );

                //Check if LB changed and video showing
                if ( lbChanged && $scope.vid.show ) {
                    //YES, we need to hide the video and restart the animation
                    $scope.vid.show = false;
                    refreshCount    = 0; //reset the refer count
                    muteAudio(); // shutdown video
                    lbState = 'lb';
                    //Let the outro run before rebuild
                    $timeout( buildAnimation, 1500 );

                } else if ( refreshCount == VID_TO_LB_RATIO ) {
                    //Time to show a video!
                    $scope.vid.show        = true;
                    $scope.vid.elem.volume = 1;
                    $scope.vid.elem.play();
                    refreshCount           = 0;
                    lbState                = 'vid';
                    $timeout( checkLBForChanges, 5000 );

                } else if ( $scope.vid.show ) {
                    //check again in 5s
                    $log.info( "No changes while playing video. Checking again in 5 seconds." );
                    $timeout( checkLBForChanges, 5000 );
                }
                else {
                    //Regular LB loop
                    //Let the outro run before rebuild
                    $timeout( buildAnimation, 1500 );
                    lbState = 'lb';

                }


            } )
            .catch( function ( err ) {
                $log.error( "Network problem getting leaderboard updates!" )

            } );


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


    checkLBForChanges();

} );
