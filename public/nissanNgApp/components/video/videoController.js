/**
 * This is the Leaderboard controller for the app
 */

app.controller( "videoController", function ( $scope, $http, $interval, $timeout, $log, $state ) {

    //The getElemById bit here is a dirty hack. Should do a directive, but fuck it,
    //this job is a zombie and I'll I got is a shovel.
    $scope.vid = { src: '/vids/attract.mp4', show: true, elem: document.getElementById( "vid" ) };

    $scope.vid.elem.addEventListener( "ended", function () {
        $log.info( ':::::::::> VIDEO ENDED <::::::::::' );
        $scope.vid.show = false;
        $scope.die();
    } );

   
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

        $log.info( "videoController: Video tapped or lb change. Either way, term vid." );
        $scope.vid.show = false;
        muteAudio(); // shutdown video
        $timeout( function(){
            $state.go( 'lb' );
        }, 500);

    }


    $scope.$on("lb:change", function(){

        $log.info("videoController: received notice of leaderboard change. Terminating vid.");
        $scope.die();

    });

    $scope.vid.show = true;
    $scope.vid.elem.volume = 1;
    $scope.vid.elem.play();

} );
