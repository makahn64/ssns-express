/**
 * Created by mkahn on 4/18/16.
 */

var app = angular.module( 'ngApp', [ "ngAnimate", "angular-gestures", "ui.router", 'toastr' ] );

app.run( function(lbService){

    lbService.getLeaderboard(); // prime the pump
    
});