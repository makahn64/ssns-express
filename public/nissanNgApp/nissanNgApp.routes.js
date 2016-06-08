/**
 * Created by mkahn on 4/18/16.
 */

app.config( function ( $stateProvider, $urlRouterProvider ) {

    console.debug( "Loading routes" );
    
    $urlRouterProvider.otherwise( '/leaderboard' );

    $stateProvider


        .state( 'lb', {
            url:         '/leaderboard',
            templateUrl: 'nissanNgApp/components/leaderboard/lb.partial.html',
            controller: 'lbController'

        } )


        .state( 'video', {
            url:         '/video',
            controller:  'videoController',
            templateUrl: 'nissanNgApp/components/video/video.partial.html'


        } )

        .state( 'ft', {
            url:         '/finaltable',
            controller:  "gameController",
            templateUrl: 'nissanNgApp/components/finaltable/ft.partial.html'

        } )

  

} );
