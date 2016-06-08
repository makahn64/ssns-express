/**
 * Created by mkahn on 4/18/16.
 */

app.factory( 'lbService', function ( $http, $rootScope, $log, $timeout ) {

    var service = {};
    
    var _leaderboard = [];
    var _pauseRefresh = false;
    
    var REFRESH_INT = 5000;
    
    

    function checkLBForChanges() {

        $log.info("lbService: checking for LB updates");

        $http.get('/players/leaderboard')
            .then( function ( dobj ) {

                var data = dobj.data; //Angular deprecation
                $log.debug( "lbService: Checking leaderboard for changes." );

                var lbChanged = data.length != _leaderboard.length;

                if ( !lbChanged ) {
                    for ( var idx = 0; idx < data.length; idx++ ) {
                        if ( data[ idx ]._id != _leaderboard[ idx ]._id ) {
                            lbChanged = true;
                            break;
                        }
                    }
                }

                if ( lbChanged ) {
                    $log.info( "lbService: Leaderboard change detected!" );
                    _leaderboard = data;
                    $rootScope.$broadcast('lb:change');
                } else {
                    $log.info( "lbService: no changes" );

                }
                

            } )
            .catch( function ( err ) {
                $log.error( "Network problem getting leaderboard updates!" )
                $rootScope.$broadcast( 'lb:fetcherror' );

            } )
            .finally( function(){
            
                if (!_pauseRefresh) $timeout(checkLBForChanges, REFRESH_INT);
                
            });


    }
    
    service.pauseRefresh = function(){
        _pauseRefresh = true;
    }
    
    service.resumeRefresh = function () {
        if (_pauseRefresh){
            _pauseRefresh = false;
            checkLBForChanges();
        }
    }
    
    service.getLeaderboard = function(){
        return _leaderboard;
    }
    
    service.clearLeaderboard = function(){
        
        return $http.post( '/players/clearlb' );
    
    }
    
    service.recordWinner = function(player){

        return $http.post( '/players/winner/' + player.dbid );
        
    }
    
    checkLBForChanges();

    return service;

});
